import api from "./api";
import {
  saveToken,
  removeToken,
} from "./storage";

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function login(data: LoginRequest) {
  const response = await api.post<TokenResponse>(
    "/auth/login",
    data
  );

  saveToken(response.data.access_token);

  return response.data;
}

export async function signup(data: SignupRequest) {
  const response = await api.post(
    "/auth/signup",
    data
  );

  return response.data;
}

export function logout() {
  removeToken();
}

export async function googleLogin(code: string) {
  const response = await api.post<TokenResponse>(
    "/auth/google",
    { code }
  );

  saveToken(response.data.access_token);

  return response.data;
}
