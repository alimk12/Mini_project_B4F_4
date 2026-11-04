import { useState } from 'react';
import CodeEditor from '../../../editor/CodeEditor';

// PLACEHOLDER (Phase 0). Owner: Maya. Spec: TASKS.md Task 2, Parts D, E, G.
// The editor is here only for the Phase 0 check: it must open with no request to any CDN (Network tab).
export default function AttemptPage() {
  const [code, setCode] = useState('function twoSum(nums, target) {\n  \n}\n');
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Attempt</h1>
      <p>Placeholder — Maya builds this page (MCQ view, coding view, exam integrity).</p>
      <CodeEditor value={code} onChange={setCode} />
    </main>
  );
}
