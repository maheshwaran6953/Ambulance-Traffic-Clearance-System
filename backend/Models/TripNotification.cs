namespace AmbulanceAPI.Models;

public enum NotificationStatus
{
    Pending,
    Cleared,
    Passed
}

public class TripNotification
{
    public int Id { get; set; }
    public int EmergencyTripId { get; set; }
    public int PoliceOfficerId { get; set; }
    public double DistanceKm { get; set; }
    public DateTime EstimatedArrival { get; set; }
    public NotificationStatus Status { get; set; } = NotificationStatus.Pending;

    // Navigation properties
    public EmergencyTrip EmergencyTrip { get; set; } = null!;
    public PoliceOfficer PoliceOfficer { get; set; } = null!;
}
