import { Role } from './common.types';

export interface User { id: number; fullName: string; email: string; role: Role }
export interface AuthResponse { accessToken: string; user: User }
export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { fullName: string; email: string; password: string }
