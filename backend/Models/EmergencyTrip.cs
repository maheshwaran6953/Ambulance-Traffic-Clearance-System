namespace AmbulanceAPI.Models;

public class EmergencyTrip
{
    public int Id { get; set; }
    public int AmbulanceId { get; set; }
    public string FromLocation { get; set; } = string.Empty;
    public string ToLocation { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Ambulance Ambulance { get; set; } = null!;
    public ICollection<TripNotification> Notifications { get; set; } = new List<TripNotification>();
}
