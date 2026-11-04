// PLACEHOLDER (Phase 0). Owner: Ali, Task 1 Part A.
export default function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert">
      {message} {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
    </div>
  );
}
