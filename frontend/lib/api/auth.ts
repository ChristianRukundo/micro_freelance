import { apiPost, apiGet } from "./api-utils";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

export interface CurrentUserResponse {
  status: string;
  data: {
    user: User;
  };
}

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return apiPost<AuthResponse>("/auth/login", { email, password });
};

export const register = async (
  name: string,
  email: string,
  password: string,
  role: "USER" | "AGENT" 
): Promise<AuthResponse> => {
  return apiPost<AuthResponse>("/auth/register", {
    name,
    email,
    password,
    role,
  }); 
};

export const logout = async (
  refreshToken: string
): Promise<{ status: string; message: string }> => {
  return apiPost<{ status: string; message: string }>("/auth/logout", {
    refreshToken,
  });
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<AuthResponse> => {
  return apiPost<AuthResponse>("/auth/refresh-token", { refreshToken });
};

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  return apiGet<CurrentUserResponse>("/auth/me");
};
