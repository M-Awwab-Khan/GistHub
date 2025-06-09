import { CodeEditorState } from "@/types/index";
import { LANGUAGE_CONFIG } from "@/constants";
import { create } from "zustand";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const getInitialState = () => {
  // if we're on the server, return default values
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  // if we're on the client, return values from local storage bc localStorage is a browser API.
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

// Debounce utility for auto-saving
let autoSaveTimeout: NodeJS.Timeout | null = null;

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,
    currentSnippetId: null,
    autoSaveCallback: null,
    isSaving: false,
    savingMessage: "",

    getCode: () => get().editor?.getValue() || "",

    setEditor: (editor: monaco.editor.IStandaloneCodeEditor) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) editor.setValue(savedCode);

      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      // Save current language code before switching
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      localStorage.setItem("editor-language", language);

      set({
        language,
        output: "",
        error: null,
      });
    },

    // Auto-save functionality
    setCurrentSnippetId: (snippetId: string | null) => {
      set({ currentSnippetId: snippetId });
    },

    setAutoSaveCallback: (
      callback: ((code: string) => Promise<void>) | null
    ) => {
      set({ autoSaveCallback: callback });
    },

    triggerAutoSave: () => {
      const { currentSnippetId, autoSaveCallback, getCode, setSaving } = get();

      if (!currentSnippetId || !autoSaveCallback) return;
      console.log("GETTING CODE", getCode());

      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Show saving status immediately
      setSaving(true, "Auto-saving...");

      // Set new timeout for debounced auto-save
      autoSaveTimeout = setTimeout(async () => {
        try {
          const code = getCode();
          await autoSaveCallback(code);
          setSaving(false, "Auto-saved");

          // Clear the success message after 2 seconds
          setTimeout(() => setSaving(false), 2000);
        } catch (error) {
          console.error("Auto-save failed:", error);
          setSaving(false, "Auto-save failed");
          setTimeout(() => setSaving(false), 2000);
        }
      }, 2000); // 2 second delay
    },

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

        console.log("data back from piston:", data);

        // handle API-level erros
        if (data.message) {
          set({
            error: data.message,
            executionResult: { code, output: "", error: data.message },
          });
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
      } catch (error) {
        console.log("Error running code:", error);
        set({
          error: "Error running code",
          executionResult: { code, output: "", error: "Error running code" },
        });
      } finally {
        set({ isRunning: false });
      }
    },

    setSaving: (isSaving: boolean, message?: string) => {
      set({ isSaving, savingMessage: message || "" });
    },
  };
});

export const getExecutionResult = () =>
  useCodeEditorStore.getState().executionResult;
