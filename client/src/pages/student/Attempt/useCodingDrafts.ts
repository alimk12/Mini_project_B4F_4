import { useCallback, useState } from 'react';

// The code and the selected problem live in AttemptPage (outside the gate). FullscreenGate removes its
// children when the student leaves full screen, so state inside CodingTestView would be lost.
export function useCodingDrafts(attemptId: number | null) {
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [codeMap, setCodeMap] = useState<Record<number, string>>({});
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);

  // A new attempt starts clean. Reloading the same attempt keeps what was typed.
  if (attemptId !== null && ownerId !== attemptId) {
    setOwnerId(attemptId);
    setCodeMap({});
    setSelectedProblemId(null);
  }

  const setCode = useCallback((problemId: number, code: string) => {
    setCodeMap((prev) => ({ ...prev, [problemId]: code }));
  }, []);

  const selectProblem = useCallback((problemId: number) => setSelectedProblemId(problemId), []);

  return { codeMap, setCode, selectedProblemId, selectProblem };
}