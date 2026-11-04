const KEY = 'b4f.token';
export function saveToken(token: string) { try { localStorage.setItem(KEY, token); } catch { /* ignore */ } }
export function getToken(): string | null { try { return localStorage.getItem(KEY); } catch { return null; } }
export function clearToken() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
