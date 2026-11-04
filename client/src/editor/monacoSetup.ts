// Monaco is bundled with the app. @monaco-editor/react would load it from a CDN by default;
// loader.config({ monaco }) switches that off, so the editor works in Syria without a VPN.
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });

monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
});
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2020,
  allowJs: true,
  checkJs: true,
  lib: ['es2020'],
  allowNonTsExtensions: true,
});

// lib is es2020 only (no DOM), so declare console for the students' debug logs.
monaco.languages.typescript.javascriptDefaults.addExtraLib(
  'declare const console: { log(...data: any[]): void; error(...data: any[]): void; warn(...data: any[]): void; info(...data: any[]): void };',
  'ts:b4f-console.d.ts',
);
