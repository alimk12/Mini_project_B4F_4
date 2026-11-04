// PLACEHOLDER (Phase 0). Owner: Ali, Task 1 Part A (examples in TASKS.md).
export function formatDateTime(iso: string | null | undefined) {
  return iso ?? '—';
}
export function formatDuration(seconds: number | null | undefined) {
  return seconds === null || seconds === undefined ? '—' : `${seconds} s`;
}
export function formatScore(score: number | null | undefined) {
  return score === null || score === undefined ? 'Expired — not submitted' : `${score}%`;
}
