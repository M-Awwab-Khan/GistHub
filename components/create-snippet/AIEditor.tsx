"use client";

import { useEffect, useRef } from "react";

import MonacoEditor from "@monaco-editor/react";
import {
  registerCompletion,
  type CompletionRegistration,
  type Monaco,
  type StandaloneCodeEditor,
} from "monacopilot";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/constants";

export default function AIEditor({
  setEditor,
  language,
  theme,
  fontSize,
  handleEditorChange,
}: {
  setEditor: (editor: StandaloneCodeEditor) => void;
  language: string;
  theme: string;
  fontSize: number;
  handleEditorChange: (value: string | undefined) => void;
}) {
  const completionRef = useRef<CompletionRegistration | null>(null);

  const handleMount = (editor: StandaloneCodeEditor, monaco: Monaco) => {
    completionRef.current = registerCompletion(monaco, editor, {
      endpoint: "/api/code-completion",
      language: LANGUAGE_CONFIG[language].monacoLanguage,
    });
    setEditor(editor);
  };

  useEffect(() => {
    return () => {
      completionRef.current?.deregister();
    };
  }, []);

  return (
    <MonacoEditor
      height="600px"
      language={LANGUAGE_CONFIG[language].monacoLanguage}
      onChange={handleEditorChange}
      theme={theme}
      beforeMount={defineMonacoThemes}
      onMount={(editor, monaco) => handleMount(editor, monaco)}
      options={{
        minimap: { enabled: false },
        fontSize,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        renderWhitespace: "selection",
        fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
        fontLigatures: true,
        cursorBlinking: "smooth",
        smoothScrolling: true,
        contextmenu: true,
        renderLineHighlight: "all",
        lineHeight: 1.6,
        letterSpacing: 0.5,
        roundedSelection: true,
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
      }}
    />
  );
}
