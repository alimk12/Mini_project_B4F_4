import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth.types';
import { request } from './http';

export const register = (p: RegisterPayload) => request<AuthResponse>('/auth/register', { method: 'POST', body: p });
export const login = (p: LoginPayload) => request<AuthResponse>('/auth/login', { method: 'POST', body: p });
export const getMe = () => request<User>('/auth/me');
