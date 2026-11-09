import { AttemptIntegrity } from '../../../types/student.types';

// The counts and the limits come from the server, so nothing is hard-coded here.
export default function IntegrityStatus({ integrity }: { integrity: AttemptIntegrity }) {
  const hasWarnings = integrity.focusViolations > 0 || integrity.clipboardViolations > 0;
  const text = `Warnings: focus ${integrity.focusViolations}/${integrity.focusLimit} · copy/paste ${integrity.clipboardViolations}/${integrity.clipboardLimit}`;
  return <p className={`attempt__integrity${hasWarnings ? ' attempt__integrity--warn' : ''}`}>{text}</p>;
}