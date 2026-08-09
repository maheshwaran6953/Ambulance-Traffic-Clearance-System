using AmbulanceAPI.Models;

namespace AmbulanceAPI.DTOs;

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public int? LinkedEntityId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string SignalLocation { get; set; } = string.Empty;
}
