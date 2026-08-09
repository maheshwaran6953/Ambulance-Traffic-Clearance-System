export type UserRole = 'Ambulance' | 'Police' | 'Admin';

export type NotificationStatus = 'Pending' | 'Cleared' | 'Passed';

export interface User {
  username: string;
  role: UserRole;
  linkedEntityId?: number;
  entityName?: string;
  signalLocation?: string;
  token: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: UserRole;
  linkedEntityId?: number;
  entityName: string;
  signalLocation: string;
}

export interface NotificationResponse {
  id: number;
  emergencyTripId: number;
  policeOfficerId: number;
  officerName: string;
  signalLocation: string;
  ambulanceRegNo: string;
  driverName: string;
  driverContact: string;
  fromLocation: string;
  toLocation: string;
  distanceKm: number;
  estimatedArrival: string;
  status: NotificationStatus;
  tripStartedAt: string;
}

export interface TripResponse {
  id: number;
  ambulanceId: number;
  ambulanceRegNo: string;
  driverName: string;
  contactNumber: string;
  fromLocation: string;
  toLocation: string;
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
  notifications: NotificationResponse[];
}

export interface RouteOption {
  from: string;
  to: string;
  signalLocations: string[];
}

export interface AdminStatsDto {
  activeTripsCount: number;
  completedTripsCount: number;
  totalOfficersCount: number;
  clearedJunctionsCount: number;
  activeTrips: TripResponse[];
}

export interface PoliceOfficerDto {
  id: number;
  name: string;
  badgeNo: string;
  signalLocation: string;
  contactNumber: string;
  currentStatus: string;
}
