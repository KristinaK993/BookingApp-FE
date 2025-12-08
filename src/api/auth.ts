import { apiFetch } from "./config";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function registerUser(
  data: RegisterRequest
): Promise<AuthResponse> {
  return await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
