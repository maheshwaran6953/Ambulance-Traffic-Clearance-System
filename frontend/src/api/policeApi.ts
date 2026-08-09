import apiClient, { DEMO_MODE } from "./apiClient";
import { getActiveTrips } from "./ambulanceApi";
import { mockNotifications, wait } from "./mockData";
import type { EmergencyNotification, Trip } from "../types";

const POLICE_STATUSES_KEY = "cw_police_notification_statuses";

function getStoredStatuses(): Record<string, "Active" | "Cleared" | "Passed"> {
  try {
    const raw = localStorage.getItem(POLICE_STATUSES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredStatus(id: string, status: "Active" | "Cleared" | "Passed") {
  try {
    const current = getStoredStatuses();
    current[id] = status;
    localStorage.setItem(POLICE_STATUSES_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage errors
  }
}

export async function getNotifications(): Promise<EmergencyNotification[]> {
  const statuses = getStoredStatuses();

  // Fetch active trips created by Ambulances to ensure real-time sync across roles!
  let activeTrips: Trip[] = [];
  try {
    activeTrips = await getActiveTrips();
  } catch {
    activeTrips = [];
  }

  // Convert active trips into police notifications if not already present
  const tripNotifications: EmergencyNotification[] = activeTrips.map((t) => ({
    id: `NTF-${t.id}`,
    tripId: t.id,
    ambulanceReg: t.ambulanceReg || "KA-01-EQ-9901",
    from: t.from,
    to: t.to,
    distanceKm: 3.4,
    etaMinutes: 8,
    signalPost: "Signal Junction A",
    status: (statuses[`NTF-${t.id}`] || statuses[t.id] || t.status || "Active") as any,
    createdAt: new Date().toISOString(),
    priorityLevel: t.priorityLevel || "Critical",
    patientType: t.patientType || "Cardiac",
  }));

  if (DEMO_MODE) {
    await wait(300);
    const combined = [...tripNotifications];
    mockNotifications.forEach((mn) => {
      const savedStatus = statuses[mn.id];
      if (savedStatus) mn.status = savedStatus;
      if (!combined.some((n) => n.id === mn.id)) {
        combined.push(mn);
      }
    });
    return combined;
  }

  try {
    const { data } = await apiClient.get<any[]>("/police/notifications");
    if (!data || data.length === 0) {
      const combined = [...tripNotifications];
      mockNotifications.forEach((mn) => {
        const savedStatus = statuses[mn.id];
        if (savedStatus) mn.status = savedStatus;
        if (!combined.some((n) => n.id === mn.id)) {
          combined.push(mn);
        }
      });
      return combined;
    }

    const apiNotifications: EmergencyNotification[] = data.map((n: any) => {
      const notifId = String(n.id || n.notificationId);
      const savedStatus = statuses[notifId];
      return {
        id: notifId,
        tripId: String(n.tripId),
        ambulanceReg: n.ambulanceRegistration || n.ambulanceReg || "KA-01-EQ-9901",
        from: n.fromLocation || n.from || "Central Hospital",
        to: n.toLocation || n.to || "City Civil Hospital",
        distanceKm: n.distanceKm ?? 5.2,
        etaMinutes: n.etaMinutes ?? 12,
        signalPost: n.signalPost || "Signal Junction A",
        status: savedStatus || n.status || "Active",
        createdAt: n.createdAt || new Date().toISOString(),
      };
    });

    // Merge trip notifications and API notifications
    const map = new Map<string, EmergencyNotification>();
    tripNotifications.forEach((n) => map.set(n.id, n));
    apiNotifications.forEach((n) => map.set(n.id, n));

    return Array.from(map.values());
  } catch (err) {
    console.warn("Using fallback notifications due to API error", err);
    const combined = [...tripNotifications];
    mockNotifications.forEach((mn) => {
      const savedStatus = statuses[mn.id];
      if (savedStatus) mn.status = savedStatus;
      if (!combined.some((n) => n.id === mn.id)) {
        combined.push(mn);
      }
    });
    return combined;
  }
}

export async function updateNotificationStatus(id: string, status: "Cleared" | "Passed"): Promise<boolean> {
  // Save status locally for persistent page reload state
  saveStoredStatus(id, status);

  // If ID has prefix NTF-TRP-8092, save for base trip ID as well
  if (id.startsWith("NTF-")) {
    const baseId = id.replace("NTF-", "");
    saveStoredStatus(baseId, status);
  }

  const numericId = parseInt(id.replace(/\D/g, ""), 10) || 1;

  if (DEMO_MODE) {
    await wait(200);
    const notif = mockNotifications.find((n) => n.id === id);
    if (notif) notif.status = status;
    return true;
  }

  try {
    await apiClient.put(`/police/notifications/${numericId}/status`, { status });
    const notif = mockNotifications.find((n) => n.id === id);
    if (notif) notif.status = status;
    return true;
  } catch (err) {
    console.warn("Update status API error, saved locally", err);
    const notif = mockNotifications.find((n) => n.id === id);
    if (notif) notif.status = status;
    return true;
  }
}
