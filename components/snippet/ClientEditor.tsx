"use client";

import { Editor } from "@monaco-editor/react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/constants";

interface ClientEditorProps {
  code: string;
  language: string;
}

function ClientEditor({ code, language }: ClientEditorProps) {
  return (
    <Editor
      height="600px"
      language={LANGUAGE_CONFIG[language]?.monacoLanguage || "javascript"}
      value={code}
      theme="vs-dark"
      beforeMount={defineMonacoThemes}
      options={{
        minimap: { enabled: false },
        fontSize: 16,
        readOnly: true,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 16 },
        renderWhitespace: "selection",
        fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
        fontLigatures: true,
      }}
    />
  );
}

export default ClientEditor;
