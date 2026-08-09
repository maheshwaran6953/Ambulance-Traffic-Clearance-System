using AmbulanceAPI.DTOs;
using AmbulanceAPI.Models;
using AmbulanceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AmbulanceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Police,Admin")]
public class PoliceController : ControllerBase
{
    private readonly ITripService _tripService;

    public PoliceController(ITripService tripService)
    {
        _tripService = tripService;
    }

    private int? GetLinkedPoliceOfficerId()
    {
        var claim = User.FindFirst("LinkedEntityId")?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }

    /// <summary>
    /// Gets all active notifications for the logged-in police officer's signal junction.
    /// </summary>
    [HttpGet("notifications")]
    [ProducesResponseType(typeof(List<NotificationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotifications()
    {
        var officerId = GetLinkedPoliceOfficerId();
        if (!officerId.HasValue)
        {
            return BadRequest(new { error = "Logged in user is not linked to a valid Police Officer entity." });
        }

        var notifications = await _tripService.GetNotificationsForOfficerAsync(officerId.Value);
        return Ok(notifications);
    }

    /// <summary>
    /// Updates the clearance status of a notification (Pending -> Cleared -> Passed).
    /// </summary>
    [HttpPut("notifications/{id}/status")]
    [ProducesResponseType(typeof(NotificationResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var officerId = GetLinkedPoliceOfficerId();
        if (!officerId.HasValue)
        {
            return BadRequest(new { error = "Logged in user is not linked to a valid Police Officer entity." });
        }

        var updated = await _tripService.UpdateNotificationStatusAsync(id, officerId.Value, request.Status);
        if (updated == null)
        {
            return NotFound(new { error = "Notification not found or unauthorized." });
        }

        return Ok(updated);
    }
}
