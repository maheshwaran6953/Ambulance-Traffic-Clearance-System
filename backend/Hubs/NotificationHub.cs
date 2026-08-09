using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace AmbulanceAPI.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var entityId = Context.User?.FindFirst("LinkedEntityId")?.Value;

        if (!string.IsNullOrEmpty(role))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Role_{role}");

            if (role == "Police" && !string.IsNullOrEmpty(entityId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Officer_{entityId}");
            }
            else if (role == "Ambulance" && !string.IsNullOrEmpty(entityId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Ambulance_{entityId}");
            }

            _logger.LogInformation("SignalR Client {ConnectionId} connected as Role={Role}, EntityId={EntityId}",
                Context.ConnectionId, role, entityId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("SignalR Client {ConnectionId} disconnected", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task AcknowledgeNotification(int notificationId)
    {
        _logger.LogInformation("Officer acknowledged notification {NotificationId}", notificationId);
        await Clients.Others.SendAsync("NotificationAcknowledged", notificationId);
    }

    public async Task RequestRouteClearance(int notificationId, string message)
    {
        _logger.LogInformation("Officer requested backup clearance for notification {NotificationId}: {Message}",
            notificationId, message);
        await Clients.Group("Role_Admin").SendAsync("BackupRequested", new { notificationId, message });
    }
}
