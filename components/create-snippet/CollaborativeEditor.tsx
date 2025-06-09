"use client";

import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useRoom } from "@liveblocks/react/suspense";
import { useCallback, useEffect, useState, useRef } from "react";
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "./Avatars";
import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness";
import { Cursors } from "./Cursors";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/constants";
import {
  registerCompletion,
  type CompletionRegistration,
  type Monaco,
  type StandaloneCodeEditor,
} from "monacopilot";

interface CollaborativeEditorProps {
  setEditor: (editor: editor.IStandaloneCodeEditor) => void;
  language: string;
  theme: string;
  fontSize: number;
  handleEditorChange: (value: string | undefined) => void;
}

// Collaborative code editor with undo/redo, live cursors, and live avatars
export function CollaborativeEditor({
  setEditor,
  language,
  theme,
  fontSize,
  handleEditorChange,
}: CollaborativeEditorProps) {
  const room = useRoom();
  const provider = getYjsProviderForRoom(room);
  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
  const completionRef = useRef<CompletionRegistration | null>(null);

  // Set up Liveblocks Yjs provider and attach Monaco editor
  useEffect(() => {
    let binding: MonacoBinding;

    if (editorRef) {
      const yDoc = provider.getYDoc();
      const yText = yDoc.getText("monaco");

      // Attach Yjs to Monaco
      binding = new MonacoBinding(
        yText,
        editorRef.getModel() as editor.ITextModel,
        new Set([editorRef]),
        provider.awareness as unknown as Awareness
      );
    }

    return () => {
      binding?.destroy();
    };
  }, [editorRef, provider]);

  const handleOnMount = useCallback(
    (monacoEditor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      // Register AI completions
      completionRef.current = registerCompletion(monaco, monacoEditor, {
        endpoint: "/api/code-completion",
        language: LANGUAGE_CONFIG[language].monacoLanguage,
      });

      // Set up editor
      setEditorRef(monacoEditor);
      setEditor(monacoEditor);

      // Listen for content changes
      monacoEditor.onDidChangeModelContent(() => {
        const value = monacoEditor.getValue();
        handleEditorChange(value);
      });
    },
    [setEditor, handleEditorChange, language]
  );

  useEffect(() => {
    return () => {
      completionRef.current?.deregister();
    };
  }, []);

  return (
    <div className={styles.container}>
      {provider ? <Cursors yProvider={provider} /> : null}
      <div className={styles.editorHeader}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-400">
            Collaborative Editor
          </span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <Avatars />
      </div>
      <div className={styles.editorContainer}>
        <Editor
          onMount={handleOnMount}
          height="600px"
          width="100%"
          language={LANGUAGE_CONFIG[language].monacoLanguage}
          theme={theme}
          beforeMount={defineMonacoThemes}
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
      </div>
    </div>
  );
}
