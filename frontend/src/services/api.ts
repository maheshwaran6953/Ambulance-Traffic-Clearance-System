import axios from 'axios';
import type { LoginResponse, TripResponse, RouteOption, NotificationResponse, AdminStatsDto, PoliceOfficerDto, NotificationStatus } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Bearer token to all outgoing HTTP requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { username, password });
    return response.data;
  },
};

export const ambulanceService = {
  getRoutes: async (): Promise<RouteOption[]> => {
    const response = await api.get<RouteOption[]>('/ambulance/routes');
    return response.data;
  },
  createTrip: async (fromLocation: string, toLocation: string): Promise<TripResponse> => {
    const response = await api.post<TripResponse>('/ambulance/trips', { fromLocation, toLocation });
    return response.data;
  },
  getActiveTrips: async (): Promise<TripResponse[]> => {
    const response = await api.get<TripResponse[]>('/ambulance/trips/active');
    return response.data;
  },
  getTripById: async (id: number): Promise<TripResponse> => {
    const response = await api.get<TripResponse>(`/ambulance/trips/${id}`);
    return response.data;
  },
  cancelTrip: async (id: number): Promise<void> => {
    await api.put(`/ambulance/trips/${id}/cancel`);
  },
};

export const policeService = {
  getNotifications: async (): Promise<NotificationResponse[]> => {
    const response = await api.get<NotificationResponse[]>('/police/notifications');
    return response.data;
  },
  updateStatus: async (notificationId: number, status: NotificationStatus): Promise<NotificationResponse> => {
    const response = await api.put<NotificationResponse>(`/police/notifications/${notificationId}/status`, { status });
    return response.data;
  },
};

export const adminService = {
  getStats: async (): Promise<AdminStatsDto> => {
    const response = await api.get<AdminStatsDto>('/admin/statistics');
    return response.data;
  },
  getOfficers: async (): Promise<PoliceOfficerDto[]> => {
    const response = await api.get<PoliceOfficerDto[]>('/admin/officers');
    return response.data;
  },
};

export default api;
