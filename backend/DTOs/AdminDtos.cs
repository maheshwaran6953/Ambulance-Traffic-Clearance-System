using AmbulanceAPI.Models;

namespace AmbulanceAPI.DTOs;

public class AdminStatsDto
{
    public int ActiveTripsCount { get; set; }
    public int CompletedTripsCount { get; set; }
    public int TotalOfficersCount { get; set; }
    public int ClearedJunctionsCount { get; set; }
    public List<TripResponse> ActiveTrips { get; set; } = new();
}

public class PoliceOfficerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BadgeNo { get; set; } = string.Empty;
    public string SignalLocation { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string CurrentStatus { get; set; } = "Normal";
}
