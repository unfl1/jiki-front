import { apiRequest } from './client';

export type LoginResponse = {
  token: string;
  nickname: string;
};

export type SignupPayload = {
  username: string;
  password1: string;
  nickname: string;
  email: string;
};

export function login(username: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/user/login', {
    method: 'POST',
    authenticated: false,
    body: { username, password },
  });
}

export function signup(payload: SignupPayload): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/user/signup', {
    method: 'POST',
    authenticated: false,
    body: payload,
  });
}
