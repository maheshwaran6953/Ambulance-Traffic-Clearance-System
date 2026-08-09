using System.Security.Claims;
using AmbulanceAPI.DTOs;
using AmbulanceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AmbulanceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Ambulance,Admin")]
public class AmbulanceController : ControllerBase
{
    private readonly ITripService _tripService;

    public AmbulanceController(ITripService tripService)
    {
        _tripService = tripService;
    }

    private int? GetLinkedAmbulanceId()
    {
        var claim = User.FindFirst("LinkedEntityId")?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }

    /// <summary>
    /// Gets predefined route options for quick selection in emergency trip creation.
    /// </summary>
    [HttpGet("routes")]
    public IActionResult GetRoutes()
    {
        return Ok(_tripService.GetAvailableRoutes());
    }

    /// <summary>
    /// Creates and starts a new emergency trip for the logged-in ambulance crew.
    /// </summary>
    [HttpPost("trips")]
    [ProducesResponseType(typeof(TripResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateTrip([FromBody] CreateTripRequest request)
    {
        var ambulanceId = GetLinkedAmbulanceId();
        if (!ambulanceId.HasValue)
        {
            return BadRequest(new { error = "Logged in user is not linked to a valid Ambulance entity." });
        }

        if (string.IsNullOrWhiteSpace(request.FromLocation) || string.IsNullOrWhiteSpace(request.ToLocation))
        {
            return BadRequest(new { error = "FromLocation and ToLocation are required." });
        }

        var trip = await _tripService.CreateTripAsync(ambulanceId.Value, request);
        if (trip == null)
        {
            return NotFound(new { error = "Ambulance record not found." });
        }

        return CreatedAtAction(nameof(GetTripById), new { id = trip.Id }, trip);
    }

    /// <summary>
    /// Gets active emergency trips for the logged-in ambulance crew.
    /// </summary>
    [HttpGet("trips/active")]
    [ProducesResponseType(typeof(List<TripResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveTrips()
    {
        var ambulanceId = GetLinkedAmbulanceId();
        if (!ambulanceId.HasValue)
        {
            return BadRequest(new { error = "Logged in user is not linked to a valid Ambulance entity." });
        }

        var trips = await _tripService.GetActiveTripsForAmbulanceAsync(ambulanceId.Value);
        return Ok(trips);
    }

    /// <summary>
    /// Gets trip details and junction notification statuses by Trip ID.
    /// </summary>
    [HttpGet("trips/{id}")]
    [ProducesResponseType(typeof(TripResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTripById(int id)
    {
        var trip = await _tripService.GetTripByIdAsync(id);
        if (trip == null) return NotFound(new { error = "Trip not found." });
        return Ok(trip);
    }

    /// <summary>
    /// Cancels an active emergency trip.
    /// </summary>
    [HttpPut("trips/{id}/cancel")]
    public async Task<IActionResult> CancelTrip(int id)
    {
        var ambulanceId = GetLinkedAmbulanceId();
        if (!ambulanceId.HasValue)
        {
            return BadRequest(new { error = "Logged in user is not linked to a valid Ambulance entity." });
        }

        var success = await _tripService.CancelTripAsync(id, ambulanceId.Value);
        if (!success) return NotFound(new { error = "Active trip not found or unauthorized." });

        return Ok(new { message = "Emergency trip cancelled successfully." });
    }
}
