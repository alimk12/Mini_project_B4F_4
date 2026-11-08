import Editor, { type Monaco, type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { attachEditorPasteGuard } from '../exam-guard/editorPasteGuard';
import './CodeEditor.css';

interface Props {
  value: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
  errorLine?: number | null;
  height?: string;
  onViolation?: (type: 'PASTE_EXTERNAL' | 'DROP_EXTERNAL') => void;
}

// Our markers use their own owner, so Monaco's own syntax errors are never touched.
const MARKER_OWNER = 'b4f-run-error';
// The props carry only the line number, so the real error text is shown in the run result below the editor.
const MARKER_MESSAGE = 'There is an error on this line. See the result below.';

export default function CodeEditor({ value, onChange, isReadOnly = false, errorLine = null, height = '360px', onViolation }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const guardRef = useRef<{ dispose(): void } | null>(null);
  const onViolationRef = useRef(onViolation);
  const [isReady, setIsReady] = useState(false);

  // The paste guard is attached once, so it must always call the latest callback.
  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  // No guard is left behind when the editor goes away.
  useEffect(
    () => () => {
      guardRef.current?.dispose();
      guardRef.current = null;
    },
    [],
  );

  const handleMount: OnMount = (monacoEditor, monaco) => {
    editorRef.current = monacoEditor;
    monacoRef.current = monaco;
    guardRef.current?.dispose();
    guardRef.current = attachEditorPasteGuard(monacoEditor, (type) => onViolationRef.current?.(type), wrapperRef.current);
    setIsReady(true);
  };

  // Show or remove the run-error marker when the line changes.
  useEffect(() => {
    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (!monaco || !model) return;
    if (errorLine === null || errorLine < 1 || errorLine > model.getLineCount()) {
      monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
      return;
    }
    monaco.editor.setModelMarkers(model, MARKER_OWNER, [
      {
        severity: monaco.MarkerSeverity.Error,
        message: MARKER_MESSAGE,
        startLineNumber: errorLine,
        startColumn: 1,
        endLineNumber: errorLine,
        endColumn: model.getLineMaxColumn(errorLine),
      },
    ]);
  }, [errorLine, isReady]);

  // The marker belongs to the code that was run, so any edit removes it.
  function handleChange(next: string | undefined) {
    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (monaco && model) monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
    onChange(next ?? '');
  }

  return (
    <div ref={wrapperRef} className={`code-editor${isReadOnly ? ' code-editor--readonly' : ''}`} data-exam-clipboard="allow">
      <Editor
        height={height}
        language="javascript"
        theme="vs-dark"
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        loading={<span className="code-editor__loading">Loading editor…</span>}
        options={{
          readOnly: isReadOnly,
          minimap: { enabled: false },
          lineNumbers: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
        }}
      />
    </div>
  );
}