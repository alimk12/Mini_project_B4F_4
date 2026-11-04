import { ReactNode } from 'react';

// PLACEHOLDER (Phase 0). Owner: Ali, Task 1 Part G. Renders its children for now.
interface Props { isFullscreen: boolean; onEnter: () => void; children: ReactNode }

export default function FullscreenGate({ children }: Props) {
  return <>{children}</>;
}
