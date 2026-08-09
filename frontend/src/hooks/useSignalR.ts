import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { API_BASE_URL, DEMO_MODE } from "../api/apiClient";
import { mockNotifications } from "../api/mockData";
import type { EmergencyNotification } from "../types";

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

export function useSignalR(token: string | null) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastNotification, setLastNotification] = useState<EmergencyNotification | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!token) return;

    if (DEMO_MODE) {
      setStatus("connecting");
      const connectTimer = setTimeout(() => setStatus("connected"), 500);
      return () => clearTimeout(connectTimer);
    }

    const hubUrl = `${API_BASE_URL.replace(/\/api\/?$/, "")}/notificationHub`;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.onreconnecting(() => setStatus("reconnecting"));
    connection.onreconnected(() => setStatus("connected"));
    connection.onclose(() => setStatus("disconnected"));

    const handleIncoming = (n: any) => {
      if (!n) return;
      const notif: EmergencyNotification = {
        id: String(n.id || n.notificationId),
        tripId: String(n.emergencyTripId || n.tripId),
        ambulanceReg: n.ambulanceNumber || n.ambulanceReg || "KA-01-EQ-9901",
        from: n.fromLocation || n.from || "North Highway",
        to: n.toLocation || n.to || "City Civil Hospital",
        distanceKm: n.distanceKm ?? 5.2,
        etaMinutes: n.etaMinutes ?? 12,
        signalPost: n.signalLocation || n.signalPost || "Signal Junction A",
        status: n.status || "Active",
        createdAt: n.timestamp || n.createdAt || new Date().toISOString(),
        patientType: n.patientType || "Cardiac",
        priorityLevel: n.priorityLevel || "Critical",
      };
      setLastNotification(notif);
    };

    connection.on("ReceiveEmergencyNotification", handleIncoming);
    connection.on("NotificationStatusUpdated", handleIncoming);

    connection
      .start()
      .then(() => setStatus("connected"))
      .catch(() => setStatus("disconnected"));

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, [token]);

  return { status, lastNotification };
}
