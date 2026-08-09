import apiClient, { DEMO_MODE } from "./apiClient";
import { mockTrips, wait } from "./mockData";
import type { Trip } from "../types";

const CANCELLED_TRIPS_KEY = "cw_cancelled_trips_list";
const USER_CREATED_TRIPS_KEY = "cw_user_created_trips";

function getCancelledIds(): string[] {
  try {
    const raw = localStorage.getItem(CANCELLED_TRIPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markCancelledId(tripId: string) {
  try {
    const current = getCancelledIds();
    if (!current.includes(tripId)) {
      current.push(tripId);
      localStorage.setItem(CANCELLED_TRIPS_KEY, JSON.stringify(current));
    }
  } catch {
    // Ignore storage errors
  }
}

function getUserCreatedTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(USER_CREATED_TRIPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUserCreatedTrip(trip: Trip) {
  try {
    const list = getUserCreatedTrips();
    list.unshift(trip);
    localStorage.setItem(USER_CREATED_TRIPS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

export async function getActiveTrips(): Promise<Trip[]> {
  const cancelledIds = getCancelledIds();
  const createdTrips = getUserCreatedTrips().filter((t) => !cancelledIds.includes(t.id));

  if (DEMO_MODE) {
    await wait(300);
    const activeMock = mockTrips.filter((t) => !cancelledIds.includes(t.id));
    return [...createdTrips, ...activeMock];
  }

  try {
    const { data } = await apiClient.get<any>("/ambulance/trips/active");
    if (!data) {
      const activeMock = mockTrips.filter((t) => !cancelledIds.includes(t.id));
      return [...createdTrips, ...activeMock];
    }

    const list = Array.isArray(data) ? data : [data];
    const backendTrips: Trip[] = list
      .map((t: any) => ({
        id: String(t.id || t.tripId || `TRP-${t.id}`),
        from: t.fromLocation || t.from || "Central Hospital",
        to: t.toLocation || t.to || "General Hospital ER",
        startedAt: t.startTime ? new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "14:02",
        status: t.status || "Active",
        ambulanceReg: t.ambulanceRegistration || t.ambulanceReg || "KA-01-EQ-9901",
        patientType: t.patientType || "Cardiac",
        priorityLevel: t.priorityLevel || "Critical",
        progressPercent: t.progressPercent ?? 35,
      }))
      .filter((t: Trip) => !cancelledIds.includes(t.id) && t.status === "Active");

    // Merge user created local trips with backend trips
    const combinedMap = new Map<string, Trip>();
    createdTrips.forEach((t) => combinedMap.set(t.id, t));
    backendTrips.forEach((t) => combinedMap.set(t.id, t));

    return Array.from(combinedMap.values());
  } catch (err) {
    console.warn("Using fallback active trips due to API error", err);
    const activeMock = mockTrips.filter((t) => !cancelledIds.includes(t.id));
    return [...createdTrips, ...activeMock];
  }
}

export async function createTrip(from: string, to: string, patientType?: string, priorityLevel?: string): Promise<Trip> {
  const newTrip: Trip = {
    id: `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
    from,
    to,
    startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: "Active",
    ambulanceReg: "KA-01-EQ-9901",
    patientType: patientType || "Trauma",
    priorityLevel: priorityLevel || "Critical",
    progressPercent: 15,
  };

  saveUserCreatedTrip(newTrip);

  if (DEMO_MODE) {
    await wait(300);
    mockTrips.unshift(newTrip);
    return newTrip;
  }

  try {
    const { data } = await apiClient.post<any>("/ambulance/trips", {
      fromLocation: from,
      toLocation: to,
      patientType,
      priorityLevel,
    });
    if (data && data.id) {
      newTrip.id = String(data.id);
    }
  } catch (err) {
    console.warn("API creation fallback, saved to local persistence", err);
  }

  return newTrip;
}

export async function cancelTrip(tripId: string): Promise<boolean> {
  // Save cancellation to persistent localStorage immediately
  markCancelledId(tripId);

  // Remove from in-memory mockTrips
  const idx = mockTrips.findIndex((t) => t.id === tripId);
  if (idx !== -1) {
    mockTrips.splice(idx, 1);
  }

  const numericId = parseInt(tripId.replace(/\D/g, ""), 10) || 1;

  if (DEMO_MODE) {
    await wait(200);
    return true;
  }

  try {
    await apiClient.put(`/ambulance/trips/${numericId}/cancel`);
    return true;
  } catch (err) {
    console.warn("API cancel trip error, cancelled in persistent storage", err);
    return true;
  }
}
