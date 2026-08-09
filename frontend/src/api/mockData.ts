import type { AdminStats, AuthUser, EmergencyNotification, Officer, Trip, UserRole } from "../types";

export const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  ambulance1: {
    password: "Password123!",
    user: { id: "1", name: "ambulance1", role: "Ambulance", identifier: "TN-39-BV-3855" },
  },
  police1: {
    password: "Password123!",
    user: { id: "2", name: "police1", role: "Police", identifier: "Signal Junction A", signalLocation: "Signal Junction A" },
  },
  admin: {
    password: "Password123!",
    user: { id: "3", name: "admin", role: "Admin", identifier: "System Admin" },
  },
};

export function mockLogin(username: string, password: string) {
  const key = username.trim().toLowerCase();
  const entry = DEMO_USERS[key];
  if (!entry || entry.password !== password) {
    throw new Error("Invalid username or password. Use ambulance1 / police1 / admin with Password123!");
  }
  const token = `demo-token-${entry.user.role}-${Date.now()}`;
  return { token, user: entry.user };
}

export const mockTrips: Trip[] = [
  {
    id: "TRP-8092",
    from: "Central Hospital, Block A",
    to: "General Hospital ER",
    startedAt: "14:02",
    status: "Active",
    ambulanceReg: "TN-39-BV-3855",
    priorityLevel: "Critical",
    patientType: "Cardiac",
    progressPercent: 25,
  },
  {
    id: "TRP-8095",
    from: "Westside Trauma Center",
    to: "Mercy Hospital",
    startedAt: "13:45",
    status: "Active",
    ambulanceReg: "TN-42-T-2397",
    priorityLevel: "High",
    patientType: "Trauma",
    progressPercent: 60,
  },
  {
    id: "TRP-8088",
    from: "City Hospital, Block B",
    to: "General Trauma Center",
    startedAt: "10:45",
    status: "Passed",
    ambulanceReg: "MH-12-AB-1234",
    priorityLevel: "High",
    patientType: "Trauma",
    progressPercent: 100,
  },
  {
    id: "TRP-8082",
    from: "Ring Road Station",
    to: "Junction A Medical Unit",
    startedAt: "09:12",
    status: "Cleared",
    ambulanceReg: "DL-01-XY-9876",
    priorityLevel: "Standard",
    patientType: "General Emergency",
    progressPercent: 100,
  },
];

export const mockNotifications: EmergencyNotification[] = [
  {
    id: "NTF-1",
    tripId: "TRP-8092",
    ambulanceReg: "KA-01-EQ-9901",
    from: "Central Hospital",
    to: "General Hospital ER",
    distanceKm: 5.2,
    etaMinutes: 12,
    signalPost: "Signal Junction A",
    status: "Active",
    createdAt: new Date().toISOString(),
    priorityLevel: "Critical",
    patientType: "Cardiac",
  },
  {
    id: "NTF-2",
    tripId: "TRP-8095",
    ambulanceReg: "MH-12-AB-1234",
    from: "Westside Trauma Center",
    to: "Mercy Hospital",
    distanceKm: 2.1,
    etaMinutes: 4,
    signalPost: "Signal Junction B",
    status: "Active",
    createdAt: new Date().toISOString(),
    priorityLevel: "High",
    patientType: "Trauma",
  },
];

export const mockOfficers: Officer[] = [
  {
    id: "off-101",
    name: "Inspector Anil",
    signalPost: "Signal Junction A (Main St & 4th Ave)",
    online: true,
    lastActiveAt: "Active Now",
    badgeNumber: "BADGE-442",
  },
  {
    id: "off-102",
    name: "Off. J. Smith",
    signalPost: "Jct 42 - Main/Broadway",
    online: true,
    lastActiveAt: "2 mins ago",
    badgeNumber: "BADGE-891",
  },
  {
    id: "off-103",
    name: "Off. M. Davis",
    signalPost: "Jct 18 - 5th Ave/Oak",
    online: true,
    lastActiveAt: "5 mins ago",
    badgeNumber: "BADGE-304",
  },
  {
    id: "off-104",
    name: "Sgt. Robert Chen",
    signalPost: "Jct 09 - West/Pine",
    online: false,
    lastActiveAt: "1 hour ago",
    badgeNumber: "BADGE-112",
  },
  {
    id: "off-105",
    name: "Off. Sarah Jenkins",
    signalPost: "Central Highway Ramp",
    online: true,
    lastActiveAt: "Active Now",
    badgeNumber: "BADGE-705",
  },
];

export function roleHomePath(role: UserRole) {
  if (role === "Ambulance") return "/ambulance/dashboard";
  if (role === "Police") return "/police/dashboard";
  return "/admin/dashboard";
}
