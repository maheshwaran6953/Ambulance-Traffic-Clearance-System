import * as signalR from '@microsoft/signalr';
import { NotificationResponse } from '../types';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  public async startConnection(token: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/notificationHub', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR WebSocket Connected successfully!');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  public onEmergencyNotification(callback: (notification: NotificationResponse) => void): void {
    if (this.connection) {
      this.connection.off('ReceiveEmergencyNotification');
      this.connection.on('ReceiveEmergencyNotification', (data: NotificationResponse) => {
        console.log('SignalR Event Received: ReceiveEmergencyNotification', data);
        callback(data);
      });
    }
  }

  public onStatusUpdated(callback: (notification: NotificationResponse) => void): void {
    if (this.connection) {
      this.connection.off('NotificationStatusUpdated');
      this.connection.on('NotificationStatusUpdated', (data: NotificationResponse) => {
        console.log('SignalR Event Received: NotificationStatusUpdated', data);
        callback(data);
      });
    }
  }

  public onTripCancelled(callback: (tripId: number) => void): void {
    if (this.connection) {
      this.connection.off('TripCancelled');
      this.connection.on('TripCancelled', (tripId: number) => {
        console.log('SignalR Event Received: TripCancelled', tripId);
        callback(tripId);
      });
    }
  }
}

export const signalRService = new SignalRService();
