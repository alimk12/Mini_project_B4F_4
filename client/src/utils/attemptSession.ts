// The session key proves that THIS browser tab is the one that opened the attempt.
// sessionStorage is per tab: it survives a refresh but is never shared with another tab.
const PREFIX = 'b4f.attemptSession.';

export function saveAttemptSession(attemptId: number, sessionKey: string) {
  try {
    sessionStorage.setItem(PREFIX + attemptId, sessionKey);
  } catch {
    /* Storage can be blocked. The backend will then ask the student to reopen the attempt. */
  }
}

export function getAttemptSession(attemptId: number): string | null {
  try {
    return sessionStorage.getItem(PREFIX + attemptId);
  } catch {
    return null;
  }
}