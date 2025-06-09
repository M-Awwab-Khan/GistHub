"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useState } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/constants";
import { Editor } from "@monaco-editor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RotateCcwIcon, ShareIcon, TypeIcon } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { EditorPanelSkeleton } from "./EditorPanelSkeleton";
import useMounted from "@/hooks/useMounted";
import ShareSnippetDialog from "./ShareSnippetDialog";
import AIEditor from "./AIEditor";
import { updateSnippetCodeWithCollaboratorCheck } from "@/lib/actions";
import { Snippet } from "@/types";

interface EditorPanelProps {
  snippet?: Snippet;
}

function EditorPanel({ snippet }: EditorPanelProps) {
  const clerk = useClerk();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const {
    theme,
    fontSize,
    setFontSize,
    setEditor,
    setSaving,
    // Only use what we actually need from the store
    editor,
  } = useCodeEditorStore();

  const mounted = useMounted();

  // Initialize editor with snippet data
  useEffect(() => {
    if (snippet && editor) {
      // Set the editor value to the snippet code
      // editor.setValue(snippet.code);

      // Set up auto-save for this specific snippet
      const handleAutoSave = async (code: string) => {
        setSaving(true, "Auto-saving...");
        try {
          await updateSnippetCodeWithCollaboratorCheck(snippet.id, code);
          setSaving(false, "Saved successful");
        } catch (error) {
          console.error("Auto-save failed:", error);
          setSaving(false, "Auto-save failed");
        }
      };

      // Set up debounced auto-save
      let autoSaveTimeout: NodeJS.Timeout;
      const debouncedAutoSave = (code: string) => {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
          handleAutoSave(code).finally(() => {
            setTimeout(() => {
              setSaving(false, undefined);
            }, 1000);
          });
        }, 2000);
      };

      // Listen to editor changes for auto-save
      const disposable = editor.onDidChangeModelContent(() => {
        const currentCode = editor.getValue();
        debouncedAutoSave(currentCode);
      });

      return () => {
        disposable.dispose();
        clearTimeout(autoSaveTimeout);
      };
    }
  }, [snippet, editor]);

  // Load font size from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem("editor-font-size", size.toString());
  };

  if (!mounted) return null;

  // Get language from snippet or default
  const language = snippet?.language || "javascript";
  console.log(language);

  return (
    <div className="relative">
      <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
              <Image
                src={"/" + language + ".png"}
                alt="Logo"
                width={24}
                height={24}
              />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Code Editor</h2>
              <p className="text-xs text-gray-500">
                {snippet
                  ? `Editing: ${snippet.title}`
                  : "Write and execute your code"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Font Size Slider */}
            <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
              <TypeIcon className="size-4 text-gray-400" />
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) =>
                    handleFontSizeChange(parseInt(e.target.value))
                  }
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                  {fontSize}
                </span>
              </div>
            </div>

            {/* Share Button - only show if we have a snippet */}
            {snippet && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsShareDialogOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
                 from-orange-500 to-amber-500 opacity-90 hover:opacity-100 transition-opacity"
              >
                <ShareIcon className="size-4 text-white" />
                <span className="text-sm font-medium text-white ">Share</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Editor  */}
        <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
          {clerk.loaded && (
            <AIEditor
              setEditor={setEditor}
              language={language}
              theme={theme}
              fontSize={fontSize}
              handleEditorChange={() => {}} // Auto-save is handled in useEffect above
            />
          )}

          {!clerk.loaded && <EditorPanelSkeleton />}
        </div>
      </div>
      {isShareDialogOpen && snippet && (
        <ShareSnippetDialog
          open={isShareDialogOpen}
          onOpenChange={(open) => setIsShareDialogOpen(open)}
        />
      )}
    </div>
  );
}
export default EditorPanel;
