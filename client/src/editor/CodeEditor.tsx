import Editor from '@monaco-editor/react';

// PLACEHOLDER (Phase 0). Owner: Maya, Task 2 Part E. Props are fixed (PROJECT-STRUCTURE.md section 5).
// Still to do: wrapperRef + attachEditorPasteGuard, errorLine markers, data-exam-clipboard="allow", read-only, styling.
interface Props {
  value: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
  errorLine?: number | null;
  height?: string;
  onViolation?: (type: 'PASTE_EXTERNAL' | 'DROP_EXTERNAL') => void;
}

export default function CodeEditor({ value, onChange, isReadOnly = false, height = '360px' }: Props) {
  return (
    <div data-exam-clipboard="allow">
      <Editor height={height} language="javascript" theme="vs-dark" value={value} onChange={(v) => onChange(v ?? '')} options={{ readOnly: isReadOnly, minimap: { enabled: false } }} />
    </div>
  );
}
