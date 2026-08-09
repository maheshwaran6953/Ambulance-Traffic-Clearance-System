import apiClient, { DEMO_MODE } from "./apiClient";
import { mockLogin, wait } from "./mockData";
import type { AuthUser, LoginRequest, LoginResponse, UserRole } from "../types";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  if (DEMO_MODE) {
    await wait(500);
    return mockLogin(payload.username, payload.password);
  }

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
}
