namespace AmbulanceAPI.Models;

public enum UserRole
{
    Ambulance,
    Police,
    Admin
}

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public int? LinkedEntityId { get; set; } // FK to Ambulance.Id or PoliceOfficer.Id depending on role
}
