import { ReactNode } from 'react';

// PLACEHOLDER (Phase 0). Owner: Ali, Task 1 Part A.
interface Props { title?: string; subtitle?: ReactNode; actions?: ReactNode; wide?: boolean; children: ReactNode }

export default function PageContainer({ title, subtitle, actions, children }: Props) {
  return (
    <main>
      {title && <h1>{title}</h1>}
      {subtitle && <p>{subtitle}</p>}
      {actions}
      {children}
    </main>
  );
}
