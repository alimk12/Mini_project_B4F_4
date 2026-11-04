// PLACEHOLDER (Phase 0). Owner: Ali, Task 1 Part G. Must be rendered OUTSIDE FullscreenGate.
export default function ViolationWarningDialog({ warning, onReturn }: { warning: string | null; onReturn: () => void }) {
  if (!warning) return null;
  return <div role="alertdialog">{warning} <button type="button" onClick={onReturn}>Return to full screen</button></div>;
}
