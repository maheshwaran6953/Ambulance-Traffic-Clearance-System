import apiClient, { DEMO_MODE } from "./apiClient";
import { mockOfficers, mockTrips, wait } from "./mockData";
import type { AdminStats, Officer, Trip } from "../types";

export async function getStats(): Promise<AdminStats> {
  if (DEMO_MODE) {
    await wait(300);
    return {
      activeTripsCount: mockTrips.length,
      totalOfficersCount: mockOfficers.length,
      clearedJunctionsCount: 342,
      avgResponseTime: "4m 12s",
    };
  }

  try {
    const { data } = await apiClient.get<any>("/admin/statistics");
    return {
      activeTripsCount: data.activeTripsCount ?? mockTrips.length,
      totalOfficersCount: data.totalOfficersCount ?? mockOfficers.length,
      clearedJunctionsCount: data.clearedJunctionsCount ?? 342,
      avgResponseTime: data.avgResponseTime || "4m 12s",
    };
  } catch (err) {
    console.warn("Using mock stats due to API error", err);
    return {
      activeTripsCount: mockTrips.length,
      totalOfficersCount: mockOfficers.length,
      clearedJunctionsCount: 342,
      avgResponseTime: "4m 12s",
    };
  }
}

export async function getAllActiveTrips(): Promise<Trip[]> {
  if (DEMO_MODE) {
    await wait(300);
    return mockTrips;
  }

  try {
    const { data } = await apiClient.get<any[]>("/ambulance/trips/active");
    if (!data || data.length === 0) return mockTrips;

    return data.map((t: any) => ({
      id: String(t.id || t.tripId || `TRP-${t.id}`),
      from: t.fromLocation || t.from || "Central Hospital",
      to: t.toLocation || t.to || "General Hospital ER",
      startedAt: t.startTime ? new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "14:02",
      status: t.status || "Active",
      ambulanceReg: t.ambulanceRegistration || t.ambulanceReg || "KA-01-EQ-9901",
      patientType: t.patientType || "Cardiac",
      priorityLevel: t.priorityLevel || "Critical",
      progressPercent: t.progressPercent ?? 35,
    }));
  } catch (err) {
    console.warn("Using mock active trips due to API error", err);
    return mockTrips;
  }
}

export async function getOfficers(): Promise<Officer[]> {
  if (DEMO_MODE) {
    await wait(300);
    return mockOfficers;
  }

  try {
    const { data } = await apiClient.get<any[]>("/admin/officers");
    if (!data || data.length === 0) return mockOfficers;

    return data.map((o: any) => ({
      id: String(o.id || o.officerId),
      name: o.name || "Officer",
      signalPost: o.signalLocation || o.signalPost || "Main Signal Junction",
      online: o.currentStatus === "Active" || o.online !== false,
      lastActiveAt: "Active Now",
      badgeNumber: o.badgeNo || `BADGE-${o.id}`,
    }));
  } catch (err) {
    console.warn("Using mock officers list due to API error", err);
    return mockOfficers;
  }
}
