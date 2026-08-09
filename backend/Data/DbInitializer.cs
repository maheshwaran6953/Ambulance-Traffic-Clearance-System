using System.Security.Cryptography;
using System.Text;
using AmbulanceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AmbulanceAPI.Data;

public static class DbInitializer
{
    public static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }

    public static void Initialize(AppDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.Users.Any())
        {
            return; // DB has been seeded
        }

        // Seed Ambulances
        var amb1 = new Ambulance
        {
            RegistrationNo = "KA-01-EQ-9901",
            DriverName = "Rajesh Kumar",
            SupportStaffName = "Suresh Patel",
            HospitalName = "Central Emergency Hospital",
            ContactNumber = "+91 98765 43210"
        };

        var amb2 = new Ambulance
        {
            RegistrationNo = "KA-01-EQ-9902",
            DriverName = "Anil Sharma",
            SupportStaffName = "Vijay Verma",
            HospitalName = "City Trauma Care Center",
            ContactNumber = "+91 98765 43211"
        };

        context.Ambulances.AddRange(amb1, amb2);
        context.SaveChanges();

        // Seed Police Officers
        var police1 = new PoliceOfficer
        {
            Name = "Inspector Ramesh Rao",
            BadgeNo = "BLR-PO-101",
            SignalLocation = "Signal-1: Central Hospital & Main Rd Junction",
            ContactNumber = "+91 98765 11111"
        };

        var police2 = new PoliceOfficer
        {
            Name = "Sub-Inspector Priya Nair",
            BadgeNo = "BLR-PO-102",
            SignalLocation = "Signal-2: Ring Road & Civil Hospital Cross",
            ContactNumber = "+91 98765 22222"
        };

        var police3 = new PoliceOfficer
        {
            Name = "Officer Vikram Singh",
            BadgeNo = "BLR-PO-103",
            SignalLocation = "Signal-3: Station Road & Market Sq",
            ContactNumber = "+91 98765 33333"
        };

        var police4 = new PoliceOfficer
        {
            Name = "Officer Deepak Gowda",
            BadgeNo = "BLR-PO-104",
            SignalLocation = "Signal-4: Highway Junction & Airport Rd",
            ContactNumber = "+91 98765 44444"
        };

        context.PoliceOfficers.AddRange(police1, police2, police3, police4);
        context.SaveChanges();

        // Seed Users
        var defaultPassword = HashPassword("Password123!");

        var users = new List<User>
        {
            new User
            {
                Username = "admin",
                PasswordHash = defaultPassword,
                Role = UserRole.Admin,
                LinkedEntityId = null
            },
            new User
            {
                Username = "ambulance1",
                PasswordHash = defaultPassword,
                Role = UserRole.Ambulance,
                LinkedEntityId = amb1.Id
            },
            new User
            {
                Username = "ambulance2",
                PasswordHash = defaultPassword,
                Role = UserRole.Ambulance,
                LinkedEntityId = amb2.Id
            },
            new User
            {
                Username = "police1",
                PasswordHash = defaultPassword,
                Role = UserRole.Police,
                LinkedEntityId = police1.Id
            },
            new User
            {
                Username = "police2",
                PasswordHash = defaultPassword,
                Role = UserRole.Police,
                LinkedEntityId = police2.Id
            },
            new User
            {
                Username = "police3",
                PasswordHash = defaultPassword,
                Role = UserRole.Police,
                LinkedEntityId = police3.Id
            },
            new User
            {
                Username = "police4",
                PasswordHash = defaultPassword,
                Role = UserRole.Police,
                LinkedEntityId = police4.Id
            }
        };

        context.Users.AddRange(users);
        context.SaveChanges();
    }
}
