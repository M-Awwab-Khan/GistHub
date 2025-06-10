import { CodeEditorState } from "@/types/index";
import { LANGUAGE_CONFIG } from "@/constants";
import { create } from "zustand";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const getInitialState = () => {
  // if we're on the server, return default values
  if (typeof window === "undefined") {
    return {
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  // Only get theme and fontSize from localStorage - no language or code storage
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;

  return {
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    language: "javascript",
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,
    // Remove unused auto-save related state
    currentSnippetId: null,
    autoSaveCallback: null,
    isSaving: false,
    savingMessage: "",

    getCode: () => get().editor?.getValue() || "",

    setEditor: (editor: monaco.editor.IStandaloneCodeEditor) => {
      // Remove localStorage code loading - this will be handled by EditorPanel
      set({ editor });
      set({ language: editor.getModel()?.getLanguageId() || "javascript" });
    },

    setSaving: (isSaving: boolean, message: string = "") => {
      set({ isSaving, savingMessage: message });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    // Remove setLanguage as it's not needed for edit pages
    setLanguage: (language: string) => {
      set({ language });
    },

    // Remove auto-save related methods as they're handled in EditorPanel now
    setCurrentSnippetId: () => {},
    setAutoSaveCallback: () => {},
    triggerAutoSave: () => {},

    runCode: async () => {
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: "Please enter some code" });
        return;
      }

      set({ isRunning: true, error: null, output: "" });

      try {
        const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
          }),
        });

        const data = await response.json();

        // handle API-level errors
        if (data.message) {
          const errorMessage = data.message;
          set({
            error: errorMessage,
            executionResult: { code, output: "", error: errorMessage },
          });

          // Save execution to database
          try {
            const { saveCodeExecution } = await import("@/lib/actions");
            await saveCodeExecution({
              language,
              code,
              output: null,
              error: errorMessage,
            });
          } catch (dbError) {
            console.error("Failed to save execution to database:", dbError);
          }
          return;
        }

        // handle compilation errors
        if (data.compile && data.compile.code !== 0) {
          const error = data.compile.stderr || data.compile.output;
          set({
            error,
            executionResult: {
              code,
              output: "",
              error,
            },
          });

          // Save execution to database
          try {
            const { saveCodeExecution } = await import("@/lib/actions");
            await saveCodeExecution({
              language,
              code,
              output: null,
              error,
            });
          } catch (dbError) {
            console.error("Failed to save execution to database:", dbError);
          }
          return;
        }

        if (data.run && data.run.code !== 0) {
          const error = data.run.stderr || data.run.output;
          set({
            error,
            executionResult: {
              code,
              output: "",
              error,
            },
          });

          // Save execution to database
          try {
            const { saveCodeExecution } = await import("@/lib/actions");
            await saveCodeExecution({
              language,
              code,
              output: null,
              error,
            });
          } catch (dbError) {
            console.error("Failed to save execution to database:", dbError);
          }
          return;
        }

        // if we get here, execution was successful
        const output = data.run.output;

        set({
          output: output.trim(),
          error: null,
          executionResult: {
            code,
            output: output.trim(),
            error: null,
          },
        });

        // Save successful execution to database
        try {
          const { saveCodeExecution } = await import("@/lib/actions");
          await saveCodeExecution({
            language,
            code,
            output: output.trim(),
            error: null,
          });
        } catch (dbError) {
          console.error("Failed to save execution to database:", dbError);
        }
      } catch (error) {
        console.log("Error running code:", error);
        const errorMessage = "Error running code";
        set({
          error: errorMessage,
          executionResult: { code, output: "", error: errorMessage },
        });

        // Save execution error to database
        try {
          const { saveCodeExecution } = await import("@/lib/actions");
          await saveCodeExecution({
            language,
            code,
            output: null,
            error: errorMessage,
          });
        } catch (dbError) {
          console.error("Failed to save execution to database:", dbError);
        }
      } finally {
        set({ isRunning: false });
      }
    },
  };
});

export const getExecutionResult = () =>
  useCodeEditorStore.getState().executionResult;
