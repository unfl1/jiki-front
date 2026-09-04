import { apiRequest } from '@/lib/api/client';

import { Session, SignupPayload } from './types';

export function login(username: string, password: string): Promise<Session> {
  return apiRequest<Session>('/user/login', { method: 'POST', authenticated: false, body: { username, password } });
}

export function signup(payload: SignupPayload): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/user/signup', { method: 'POST', authenticated: false, body: payload });
}
