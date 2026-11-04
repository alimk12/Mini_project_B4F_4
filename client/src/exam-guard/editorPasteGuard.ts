import type { editor } from 'monaco-editor';

type PasteViolation = 'PASTE_EXTERNAL' | 'DROP_EXTERNAL';

// PLACEHOLDER (Phase 0). Owner: Ali, Task 1 Part G. Listens on `root` (CodeEditor's wrapper div), not editor.getDomNode().
export function attachEditorPasteGuard(_ed: editor.IStandaloneCodeEditor, _onViolation: (type: PasteViolation) => void, _root?: HTMLElement | null) {
  return { dispose() {} };
}
