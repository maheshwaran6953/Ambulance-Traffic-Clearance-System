using AmbulanceAPI.Data;
using AmbulanceAPI.DTOs;
using AmbulanceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AmbulanceAPI.Services;

public interface ITripService
{
    Task<TripResponse?> CreateTripAsync(int ambulanceId, CreateTripRequest request);
    Task<List<TripResponse>> GetActiveTripsForAmbulanceAsync(int ambulanceId);
    Task<TripResponse?> GetTripByIdAsync(int tripId);
    Task<bool> CancelTripAsync(int tripId, int ambulanceId);
    Task<List<NotificationResponse>> GetNotificationsForOfficerAsync(int policeOfficerId);
    Task<NotificationResponse?> UpdateNotificationStatusAsync(int notificationId, int policeOfficerId, NotificationStatus newStatus);
    Task<AdminStatsDto> GetAdminStatsAsync();
    List<RouteOptionDto> GetAvailableRoutes();
}

public class TripService : ITripService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ILogger<TripService> _logger;

    public TripService(AppDbContext context, INotificationService notificationService, ILogger<TripService> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    public List<RouteOptionDto> GetAvailableRoutes()
    {
        return new List<RouteOptionDto>
        {
            new RouteOptionDto
            {
                From = "Central Hospital",
                To = "City Civil Hospital",
                SignalLocations = new List<string>
                {
                    "Signal-1: Central Hospital & Main Rd Junction",
                    "Signal-2: Ring Road & Civil Hospital Cross"
                }
            },
            new RouteOptionDto
            {
                From = "City Trauma Care Center",
                To = "Airport Road Trauma Emergency",
                SignalLocations = new List<string>
                {
                    "Signal-3: Station Road & Market Sq",
                    "Signal-4: Highway Junction & Airport Rd"
                }
            },
            new RouteOptionDto
            {
                From = "St. Mary Medical Center",
                To = "Government General Hospital",
                SignalLocations = new List<string>
                {
                    "Signal-1: Central Hospital & Main Rd Junction",
                    "Signal-3: Station Road & Market Sq",
                    "Signal-2: Ring Road & Civil Hospital Cross"
                }
            }
        };
    }

    public async Task<TripResponse?> CreateTripAsync(int ambulanceId, CreateTripRequest request)
    {
        var ambulance = await _context.Ambulances.FindAsync(ambulanceId);
        if (ambulance == null) return null;

        // Deactivate any existing active trips for this ambulance
        var existingActiveTrips = await _context.EmergencyTrips
            .Where(t => t.AmbulanceId == ambulanceId && t.IsActive)
            .ToListAsync();

        foreach (var activeTrip in existingActiveTrips)
        {
            activeTrip.IsActive = false;
            activeTrip.EndedAt = DateTime.UtcNow;
        }

        var trip = new EmergencyTrip
        {
            AmbulanceId = ambulanceId,
            FromLocation = request.FromLocation,
            ToLocation = request.ToLocation,
            StartedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.EmergencyTrips.Add(trip);
        await _context.SaveChangesAsync();

        // Route Matching: Find officers whose SignalLocation matches signals along route
        var allOfficers = await _context.PoliceOfficers.ToListAsync();
        var routeOptions = GetAvailableRoutes();
        var matchedRoute = routeOptions.FirstOrDefault(r => 
            (r.From.Equals(request.FromLocation, StringComparison.OrdinalIgnoreCase) &&
             r.To.Equals(request.ToLocation, StringComparison.OrdinalIgnoreCase)) ||
            (request.FromLocation.Contains(r.From, StringComparison.OrdinalIgnoreCase) || 
             request.ToLocation.Contains(r.To, StringComparison.OrdinalIgnoreCase)));

        List<PoliceOfficer> targetOfficers = new();
        if (matchedRoute != null)
        {
            targetOfficers = allOfficers
                .Where(po => matchedRoute.SignalLocations.Any(sl => sl.Equals(po.SignalLocation, StringComparison.OrdinalIgnoreCase)))
                .ToList();
        }
        
        // Fallback: If no exact pre-defined route matches, assign nearest officers by index
        if (matchedRoute == null || !targetOfficers.Any())
        {
            targetOfficers = allOfficers.Take(3).ToList();
        }

        double baseDistance = 2.5;
        int etaMinutesStep = 4;
        int step = 0;

        var notifications = new List<TripNotification>();

        foreach (var officer in targetOfficers)
        {
            step++;
            double distance = Math.Round(baseDistance * step, 1);
            DateTime eta = DateTime.UtcNow.AddMinutes(etaMinutesStep * step);

            var notification = new TripNotification
            {
                EmergencyTripId = trip.Id,
                PoliceOfficerId = officer.Id,
                DistanceKm = distance,
                EstimatedArrival = eta,
                Status = NotificationStatus.Pending
            };

            _context.TripNotifications.Add(notification);
            notifications.Add(notification);
        }

        await _context.SaveChangesAsync();

        var tripResponse = await MapToTripResponseAsync(trip.Id);

        if (tripResponse != null)
        {
            // Broadcast real-time notifications via SignalR
            foreach (var notif in tripResponse.Notifications)
            {
                await _notificationService.BroadcastEmergencyNotificationAsync(notif);
            }
        }

        return tripResponse;
    }

    public async Task<List<TripResponse>> GetActiveTripsForAmbulanceAsync(int ambulanceId)
    {
        var trips = await _context.EmergencyTrips
            .Where(t => t.AmbulanceId == ambulanceId && t.IsActive)
            .OrderByDescending(t => t.StartedAt)
            .Select(t => t.Id)
            .ToListAsync();

        var responses = new List<TripResponse>();
        foreach (var id in trips)
        {
            var res = await MapToTripResponseAsync(id);
            if (res != null) responses.Add(res);
        }

        return responses;
    }

    public async Task<TripResponse?> GetTripByIdAsync(int tripId)
    {
        return await MapToTripResponseAsync(tripId);
    }

    public async Task<bool> CancelTripAsync(int tripId, int ambulanceId)
    {
        var trip = await _context.EmergencyTrips.FirstOrDefaultAsync(t => t.Id == tripId && t.AmbulanceId == ambulanceId);
        if (trip == null) return false;

        trip.IsActive = false;
        trip.EndedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _notificationService.BroadcastTripCancelledAsync(tripId);
        return true;
    }

    public async Task<List<NotificationResponse>> GetNotificationsForOfficerAsync(int policeOfficerId)
    {
        var notifications = await _context.TripNotifications
            .Include(tn => tn.EmergencyTrip)
                .ThenInclude(et => et.Ambulance)
            .Include(tn => tn.PoliceOfficer)
            .Where(tn => tn.PoliceOfficerId == policeOfficerId && tn.EmergencyTrip.IsActive)
            .OrderByDescending(tn => tn.EmergencyTrip.StartedAt)
            .ToListAsync();

        return notifications.Select(MapToNotificationResponse).ToList();
    }

    public async Task<NotificationResponse?> UpdateNotificationStatusAsync(int notificationId, int policeOfficerId, NotificationStatus newStatus)
    {
        var notification = await _context.TripNotifications
            .Include(tn => tn.EmergencyTrip)
                .ThenInclude(et => et.Ambulance)
            .Include(tn => tn.PoliceOfficer)
            .FirstOrDefaultAsync(tn => tn.Id == notificationId);

        if (notification == null) return null;

        notification.Status = newStatus;
        await _context.SaveChangesAsync();

        var response = MapToNotificationResponse(notification);

        // Check if all notifications for this trip are passed -> mark trip ended
        var allTripNotifs = await _context.TripNotifications
            .Where(tn => tn.EmergencyTripId == notification.EmergencyTripId)
            .ToListAsync();

        if (allTripNotifs.All(tn => tn.Status == NotificationStatus.Passed))
        {
            var trip = await _context.EmergencyTrips.FindAsync(notification.EmergencyTripId);
            if (trip != null)
            {
                trip.IsActive = false;
                trip.EndedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        // Broadcast real-time update
        await _notificationService.BroadcastStatusUpdateAsync(response);

        return response;
    }

    public async Task<AdminStatsDto> GetAdminStatsAsync()
    {
        var activeTripsCount = await _context.EmergencyTrips.CountAsync(t => t.IsActive);
        var completedTripsCount = await _context.EmergencyTrips.CountAsync(t => !t.IsActive);
        var totalOfficersCount = await _context.PoliceOfficers.CountAsync();
        var clearedJunctionsCount = await _context.TripNotifications.CountAsync(tn => tn.Status == NotificationStatus.Cleared || tn.Status == NotificationStatus.Passed);

        var activeTripIds = await _context.EmergencyTrips
            .Where(t => t.IsActive)
            .Select(t => t.Id)
            .ToListAsync();

        var activeTripResponses = new List<TripResponse>();
        foreach (var id in activeTripIds)
        {
            var res = await MapToTripResponseAsync(id);
            if (res != null) activeTripResponses.Add(res);
        }

        return new AdminStatsDto
        {
            ActiveTripsCount = activeTripsCount,
            CompletedTripsCount = completedTripsCount,
            TotalOfficersCount = totalOfficersCount,
            ClearedJunctionsCount = clearedJunctionsCount,
            ActiveTrips = activeTripResponses
        };
    }

    private async Task<TripResponse?> MapToTripResponseAsync(int tripId)
    {
        var trip = await _context.EmergencyTrips
            .Include(t => t.Ambulance)
            .Include(t => t.Notifications)
                .ThenInclude(n => n.PoliceOfficer)
            .FirstOrDefaultAsync(t => t.Id == tripId);

        if (trip == null) return null;

        return new TripResponse
        {
            Id = trip.Id,
            AmbulanceId = trip.AmbulanceId,
            AmbulanceRegNo = trip.Ambulance?.RegistrationNo ?? "N/A",
            DriverName = trip.Ambulance?.DriverName ?? "N/A",
            ContactNumber = trip.Ambulance?.ContactNumber ?? "N/A",
            FromLocation = trip.FromLocation,
            ToLocation = trip.ToLocation,
            StartedAt = trip.StartedAt,
            EndedAt = trip.EndedAt,
            IsActive = trip.IsActive,
            Notifications = trip.Notifications.Select(MapToNotificationResponse).ToList()
        };
    }

    private static NotificationResponse MapToNotificationResponse(TripNotification tn)
    {
        return new NotificationResponse
        {
            Id = tn.Id,
            EmergencyTripId = tn.EmergencyTripId,
            PoliceOfficerId = tn.PoliceOfficerId,
            OfficerName = tn.PoliceOfficer?.Name ?? "N/A",
            SignalLocation = tn.PoliceOfficer?.SignalLocation ?? "N/A",
            AmbulanceRegNo = tn.EmergencyTrip?.Ambulance?.RegistrationNo ?? "N/A",
            DriverName = tn.EmergencyTrip?.Ambulance?.DriverName ?? "N/A",
            DriverContact = tn.EmergencyTrip?.Ambulance?.ContactNumber ?? "N/A",
            FromLocation = tn.EmergencyTrip?.FromLocation ?? "N/A",
            ToLocation = tn.EmergencyTrip?.ToLocation ?? "N/A",
            DistanceKm = tn.DistanceKm,
            EstimatedArrival = tn.EstimatedArrival,
            Status = tn.Status,
            TripStartedAt = tn.EmergencyTrip?.StartedAt ?? DateTime.UtcNow
        };
    }
}
