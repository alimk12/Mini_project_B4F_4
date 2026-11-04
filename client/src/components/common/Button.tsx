import { ButtonHTMLAttributes } from 'react';

// PLACEHOLDER (Phase 0). Owner: Ali, Task 1 Part A. Props are fixed.
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'normal' | 'small';
  isLoading?: boolean;
}

export default function Button({ variant: _v, size: _s, isLoading = false, disabled, type = 'button', ...rest }: Props) {
  return <button type={type} disabled={disabled || isLoading} {...rest} />;
}
