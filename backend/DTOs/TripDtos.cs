using AmbulanceAPI.Models;

namespace AmbulanceAPI.DTOs;

public class CreateTripRequest
{
    public string FromLocation { get; set; } = string.Empty;
    public string ToLocation { get; set; } = string.Empty;
}

public class TripResponse
{
    public int Id { get; set; }
    public int AmbulanceId { get; set; }
    public string AmbulanceRegNo { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string FromLocation { get; set; } = string.Empty;
    public string ToLocation { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public bool IsActive { get; set; }
    public List<NotificationResponse> Notifications { get; set; } = new();
}

public class RouteOptionDto
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public List<string> SignalLocations { get; set; } = new();
}
