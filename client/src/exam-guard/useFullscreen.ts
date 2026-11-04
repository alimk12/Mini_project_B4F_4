// PLACEHOLDER (Phase 0). Owner: Ali, Task 1 Part G. Exports are fixed (PROJECT-STRUCTURE.md 16.2).
export function useFullscreen() {
  return {
    isSupported: true,
    isFullscreen: true,
    enter: async (): Promise<boolean> => true,
    exit: async (): Promise<void> => {},
  };
}
