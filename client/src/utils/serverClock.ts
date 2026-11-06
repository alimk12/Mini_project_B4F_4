// Clock helpers. The server owns the deadline; the browser only displays it.
// offsetMs = (server time) - (this computer's time), so a wrong PC clock cannot change the countdown.

export function getOffsetMs(serverNow: string): number {
  return Date.parse(serverNow) - Date.now();
}

export function getRemainingMs(deadline: string, offsetMs: number): number {
  return Math.max(0, Date.parse(deadline) - (Date.now() + offsetMs));
}

export function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}