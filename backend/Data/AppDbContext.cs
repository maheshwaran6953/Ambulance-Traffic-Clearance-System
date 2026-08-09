using AmbulanceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AmbulanceAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Ambulance> Ambulances => Set<Ambulance>();
    public DbSet<PoliceOfficer> PoliceOfficers => Set<PoliceOfficer>();
    public DbSet<EmergencyTrip> EmergencyTrips => Set<EmergencyTrip>();
    public DbSet<TripNotification> TripNotifications => Set<TripNotification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // EmergencyTrip -> Ambulance relationship
        modelBuilder.Entity<EmergencyTrip>()
            .HasOne(et => et.Ambulance)
            .WithMany(a => a.EmergencyTrips)
            .HasForeignKey(et => et.AmbulanceId)
            .OnDelete(DeleteBehavior.Cascade);

        // TripNotification -> EmergencyTrip relationship
        modelBuilder.Entity<TripNotification>()
            .HasOne(tn => tn.EmergencyTrip)
            .WithMany(et => et.Notifications)
            .HasForeignKey(tn => tn.EmergencyTripId)
            .OnDelete(DeleteBehavior.Cascade);

        // TripNotification -> PoliceOfficer relationship
        modelBuilder.Entity<TripNotification>()
            .HasOne(tn => tn.PoliceOfficer)
            .WithMany(po => po.Notifications)
            .HasForeignKey(tn => tn.PoliceOfficerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Enums as strings in database for clear inspection
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<TripNotification>()
            .Property(tn => tn.Status)
            .HasConversion<string>();
    }
}
