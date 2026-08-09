using AmbulanceAPI.DTOs;
using AmbulanceAPI.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace AmbulanceAPI.Services;

public interface INotificationService
{
    Task BroadcastEmergencyNotificationAsync(NotificationResponse notification);
    Task BroadcastStatusUpdateAsync(NotificationResponse notification);
    Task BroadcastTripCancelledAsync(int tripId);
}

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(IHubContext<NotificationHub> hubContext, ILogger<NotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task BroadcastEmergencyNotificationAsync(NotificationResponse notification)
    {
        _logger.LogInformation("Broadcasting new Emergency Notification {NotificationId} to Officer_{OfficerId} and Admins",
            notification.Id, notification.PoliceOfficerId);

        // Send to targeted police officer group
        await _hubContext.Clients.Group($"Officer_{notification.PoliceOfficerId}")
            .SendAsync("ReceiveEmergencyNotification", notification);

        // Send to Admin group
        await _hubContext.Clients.Group("Role_Admin")
            .SendAsync("ReceiveEmergencyNotification", notification);
    }

    public async Task BroadcastStatusUpdateAsync(NotificationResponse notification)
    {
        _logger.LogInformation("Broadcasting status update for Notification {NotificationId} to Status={Status}",
            notification.Id, notification.Status);

        // Notify specific police officer
        await _hubContext.Clients.Group($"Officer_{notification.PoliceOfficerId}")
            .SendAsync("NotificationStatusUpdated", notification);

        // Notify admins
        await _hubContext.Clients.Group("Role_Admin")
            .SendAsync("NotificationStatusUpdated", notification);

        // Notify all ambulance users
        await _hubContext.Clients.Group("Role_Ambulance")
            .SendAsync("NotificationStatusUpdated", notification);
    }

    public async Task BroadcastTripCancelledAsync(int tripId)
    {
        _logger.LogInformation("Broadcasting Trip Cancelled for TripId={TripId}", tripId);
        await _hubContext.Clients.All.SendAsync("TripCancelled", tripId);
    }
}
