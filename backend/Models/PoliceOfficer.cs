namespace AmbulanceAPI.Models;

public class PoliceOfficer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BadgeNo { get; set; } = string.Empty;
    public string SignalLocation { get; set; } = string.Empty; // e.g., "Signal-A: Main Road & Hospital Rd"
    public string ContactNumber { get; set; } = string.Empty;

    // Navigation property
    public ICollection<TripNotification> Notifications { get; set; } = new List<TripNotification>();
}
