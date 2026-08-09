export type UserRole = "Ambulance" | "Police" | "Admin";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  identifier: string;
  signalLocation?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export type TripStatus = "Active" | "Cleared" | "Passed" | "Completed" | "Pending";

export interface Trip {
  id: string;
  from: string;
  to: string;
  startedAt: string;
  status: TripStatus;
  ambulanceReg?: string;
  patientType?: string;
  priorityLevel?: string;
  progressPercent?: number;
}

export interface EmergencyNotification {
  id: string;
  tripId: string;
  ambulanceReg: string;
  from: string;
  to: string;
  distanceKm: number;
  etaMinutes: number;
  signalPost: string;
  status: TripStatus;
  createdAt: string;
  patientType?: string;
  priorityLevel?: string;
}

export interface Officer {
  id: string;
  name: string;
  signalPost: string;
  online: boolean;
  lastActiveAt: string;
  badgeNumber?: string;
}

export interface AdminStats {
  activeTripsCount: number;
  totalOfficersCount: number;
  clearedJunctionsCount: number;
  avgResponseTime: string;
}
