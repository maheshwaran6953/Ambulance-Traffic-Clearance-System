namespace AmbulanceAPI.Models;

public class Ambulance
{
    public int Id { get; set; }
    public string RegistrationNo { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public string SupportStaffName { get; set; } = string.Empty;
    public string HospitalName { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;

    // Navigation property
    public ICollection<EmergencyTrip> EmergencyTrips { get; set; } = new List<EmergencyTrip>();
}
