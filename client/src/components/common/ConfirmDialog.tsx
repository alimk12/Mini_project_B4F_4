import { ReactNode } from 'react';

// PLACEHOLDER (Phase 0). Owner: Ali, Task 1 Part A. Props are fixed.
interface Props {
  isOpen: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  isLoading?: boolean;
  onConfirm(): void;
  onCancel(): void;
}

export default function ConfirmDialog({ isOpen, title, children, confirmLabel = 'Confirm', cancelLabel = 'Cancel', isLoading, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title}>
      <h2>{title}</h2>
      {children}
      <button type="button" onClick={onCancel} disabled={isLoading}>{cancelLabel}</button>
      <button type="button" onClick={onConfirm} disabled={isLoading}>{confirmLabel}</button>
    </div>
  );
}
