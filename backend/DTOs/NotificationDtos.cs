using AmbulanceAPI.Models;

namespace AmbulanceAPI.DTOs;

public class NotificationResponse
{
    public int Id { get; set; }
    public int EmergencyTripId { get; set; }
    public int PoliceOfficerId { get; set; }
    public string OfficerName { get; set; } = string.Empty;
    public string SignalLocation { get; set; } = string.Empty;
    public string AmbulanceRegNo { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public string DriverContact { get; set; } = string.Empty;
    public string FromLocation { get; set; } = string.Empty;
    public string ToLocation { get; set; } = string.Empty;
    public double DistanceKm { get; set; }
    public DateTime EstimatedArrival { get; set; }
    public NotificationStatus Status { get; set; }
    public DateTime TripStartedAt { get; set; }
}

public class UpdateStatusRequest
{
    public NotificationStatus Status { get; set; }
}
