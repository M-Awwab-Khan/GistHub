"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Header from "@/components/create-snippet/Header";
import EditorPanel from "@/components/create-snippet/EditorPanel";
import OutputPanel from "@/components/create-snippet/OutputPanel";
import { getSnippet, updateSnippetCode } from "@/lib/actions";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import toast from "react-hot-toast";

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  userId: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function EditSnippetPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    setLanguage,
    setCurrentSnippetId,
    setAutoSaveCallback,
    editor,
    triggerAutoSave,
  } = useCodeEditorStore();

  const snippetId = params.id as string;

  // Fetch snippet data
  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        setLoading(true);
        const snippetData = await getSnippet(snippetId);

        if (!snippetData) {
          setError("Snippet not found");
          return;
        }

        // Check if user owns this snippet
        if (user && snippetData.userId !== user.id) {
          setError("You don't have permission to edit this snippet");
          return;
        }

        setSnippet(snippetData);

        // Set the language in the editor
        setLanguage(snippetData.language);

        // Set up auto-saving
        setCurrentSnippetId(snippetId);
        setAutoSaveCallback(async (code: string) => {
          try {
            await updateSnippetCode(snippetId, code);
            console.log("Auto-saved successfully");
          } catch (error) {
            console.error("Auto-save failed:", error);
          }
        });
      } catch (err) {
        console.error("Error fetching snippet:", err);
        setError("Failed to load snippet");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchSnippet();
    } else if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [
    snippetId,
    user,
    isLoaded,
    router,
    setLanguage,
    setCurrentSnippetId,
    setAutoSaveCallback,
  ]);

  // Set up editor with snippet code when editor is ready
  useEffect(() => {
    if (editor && snippet) {
      // Clear any existing code first
      const currentCode = editor.getValue();
      if (currentCode !== snippet.code) {
        editor.setValue(snippet.code);
      }

      // Listen for editor changes and trigger auto-save
      const disposable = editor.onDidChangeModelContent(() => {
        triggerAutoSave();
      });

      return () => disposable.dispose();
    }
  }, [editor, snippet, triggerAutoSave]);

  const handleTitleUpdate = (newTitle: string) => {
    if (snippet) {
      setSnippet({ ...snippet, title: newTitle });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a0a] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-white text-lg">Loading snippet...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a0a] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-red-400 text-xl mb-4">{error}</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Auth check
  if (!isLoaded || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a0a] to-[#0a0a0f]">
      <div className="max-w-[1800px] mx-auto p-4">
        <Header
          snippetId={snippetId}
          snippetTitle={snippet?.title}
          onTitleUpdate={handleTitleUpdate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EditorPanel />
          <OutputPanel />
        </div>
      </div>
    </div>
  );
}
