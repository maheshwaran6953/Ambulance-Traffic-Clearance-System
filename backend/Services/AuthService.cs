using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AmbulanceAPI.Data;
using AmbulanceAPI.DTOs;
using AmbulanceAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AmbulanceAPI.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var hash = DbInitializer.HashPassword(request.Password);
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower() && u.PasswordHash == hash);

        if (user == null)
        {
            return null;
        }

        string entityName = string.Empty;
        string signalLocation = string.Empty;

        if (user.Role == UserRole.Ambulance && user.LinkedEntityId.HasValue)
        {
            var amb = await _context.Ambulances.FindAsync(user.LinkedEntityId.Value);
            if (amb != null) entityName = $"{amb.RegistrationNo} ({amb.HospitalName})";
        }
        else if (user.Role == UserRole.Police && user.LinkedEntityId.HasValue)
        {
            var officer = await _context.PoliceOfficers.FindAsync(user.LinkedEntityId.Value);
            if (officer != null)
            {
                entityName = officer.Name;
                signalLocation = officer.SignalLocation;
            }
        }
        else if (user.Role == UserRole.Admin)
        {
            entityName = "System Administrator";
        }

        var secret = _configuration["Jwt:Secret"] ?? "SuperSecretKeyForAmbulanceTrafficClearanceSystem2026!";
        var key = Encoding.UTF8.GetBytes(secret);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        if (user.LinkedEntityId.HasValue)
        {
            claims.Add(new Claim("LinkedEntityId", user.LinkedEntityId.Value.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(24),
            Issuer = _configuration["Jwt:Issuer"] ?? "AmbulanceClearanceAPI",
            Audience = _configuration["Jwt:Audience"] ?? "AmbulanceClearanceClients",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new LoginResponse
        {
            Token = tokenHandler.WriteToken(token),
            Username = user.Username,
            Role = user.Role,
            LinkedEntityId = user.LinkedEntityId,
            EntityName = entityName,
            SignalLocation = signalLocation
        };
    }
}
