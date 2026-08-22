import apiClient, { DEMO_MODE } from "./apiClient";
import { mockLogin, wait } from "./mockData";
import type { AuthUser, LoginRequest, LoginResponse, UserRole } from "../types";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  if (DEMO_MODE) {
    await wait(400);
    return mockLogin(payload.username, payload.password);
  }

  try {
    const { data } = await apiClient.post<any>("/auth/login", payload);

    let roleStr: UserRole = "Ambulance";
    if (data.role === 1 || data.role === "Police") roleStr = "Police";
    else if (data.role === 2 || data.role === "Admin") roleStr = "Admin";

    const user: AuthUser = {
      id: String(data.linkedEntityId || 1),
      name: data.username,
      role: roleStr,
      identifier: data.entityName || data.signalLocation || data.username,
      signalLocation: data.signalLocation,
    };

    return {
      token: data.token,
      user,
    };
  } catch (err: any) {
    // If backend database API is unreachable (Network Error / offline), gracefully fall back to mock authentication
    if (!err.response || err.code === "ERR_NETWORK" || err.message === "Network Error") {
      console.warn("Backend server offline, falling back to mock authentication.");
      await wait(300);
      return mockLogin(payload.username, payload.password);
    }
    throw err;
  }
}
