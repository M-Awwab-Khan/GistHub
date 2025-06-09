"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useRoom } from "@liveblocks/react/suspense";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness";
import styles from "./CollaborativeEditor.module.css";

import MonacoEditor, { Editor } from "@monaco-editor/react";
import {
  registerCompletion,
  type CompletionRegistration,
  type Monaco,
  type StandaloneCodeEditor,
} from "monacopilot";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/constants";
import { Cursors } from "./Cursors";
import { Avatars } from "./Avatars";
import { Toolbar } from "./Toolbar";

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
  handleEditorChange: () => void;
}) {
  const room = useRoom();
  const provider = getYjsProviderForRoom(room);
  const [editorRef, setEditorRef] = useState<StandaloneCodeEditor>();
  const completionRef = useRef<CompletionRegistration | null>(null);

  // Set up Liveblocks Yjs provider and attach Monaco editor for collaboration
  useEffect(() => {
    let binding: MonacoBinding;

    if (editorRef) {
      const yDoc = provider.getYDoc();
      const yText = yDoc.getText("monaco");

      // Attach Yjs to Monaco for real-time collaboration
      binding = new MonacoBinding(
        yText,
        editorRef.getModel() as any,
        new Set([editorRef]),
        provider.awareness as unknown as Awareness
      );
    }

    return () => {
      binding?.destroy();
    };
  }, [editorRef, provider]);

  const handleMount = useCallback(
    (editor: StandaloneCodeEditor, monaco: Monaco) => {
      // Register AI completions
      completionRef.current = registerCompletion(monaco, editor, {
        endpoint: "/api/code-completion",
        language: LANGUAGE_CONFIG[language].monacoLanguage,
      });

      // Set up editor references
      setEditorRef(editor);
      setEditor(editor);

      // Listen for content changes
      editor.onDidChangeModelContent(() => {
        handleEditorChange();
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
    <div className="relative">
      {/* Live cursors overlay */}
      {provider ? <Cursors yProvider={provider} /> : null}

      {/* Collaboration header with avatars */}
      <div className={styles.editorHeader}>
        <div>{editorRef ? <Toolbar editor={editorRef} /> : null}</div>
        <Avatars />
      </div>

      {/* Monaco Editor */}
      <Editor
        height="600px"
        language={LANGUAGE_CONFIG[language].monacoLanguage}
        theme={theme}
        beforeMount={defineMonacoThemes}
        onMount={handleMount}
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
  );
}
