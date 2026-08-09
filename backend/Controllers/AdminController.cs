using AmbulanceAPI.Data;
using AmbulanceAPI.DTOs;
using AmbulanceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AmbulanceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ITripService _tripService;
    private readonly AppDbContext _context;

    public AdminController(ITripService tripService, AppDbContext context)
    {
        _tripService = tripService;
        _context = context;
    }

    /// <summary>
    /// Gets overall system statistics and active trip monitoring data.
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(AdminStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics()
    {
        var stats = await _tripService.GetAdminStatsAsync();
        return Ok(stats);
    }

    /// <summary>
    /// Gets list of all police officers and their assigned signal locations.
    /// </summary>
    [HttpGet("officers")]
    [ProducesResponseType(typeof(List<PoliceOfficerDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOfficers()
    {
        var officers = await _context.PoliceOfficers.ToListAsync();
        var dtos = officers.Select(o => new PoliceOfficerDto
        {
            Id = o.Id,
            Name = o.Name,
            BadgeNo = o.BadgeNo,
            SignalLocation = o.SignalLocation,
            ContactNumber = o.ContactNumber,
            CurrentStatus = "Active"
        }).ToList();

        return Ok(dtos);
    }
}
