"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Header from "@/components/create-snippet/Header";
import EditorPanel from "@/components/create-snippet/EditorPanel";
import OutputPanel from "@/components/create-snippet/OutputPanel";
import {
  getSnippetWithCollaborators,
  updateSnippetCodeWithCollaboratorCheck,
  checkSnippetEditPermission,
} from "@/lib/actions";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import toast from "react-hot-toast";
import { Room } from "./Room";
import { Snippet, SnippetCollaborator } from "@/types";

interface SnippetWithCollaborators extends Snippet {
  collaborators: SnippetCollaborator[];
}

export default function EditSnippetPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [snippet, setSnippet] = useState<SnippetWithCollaborators | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const {
    setLanguage,
    setCurrentSnippetId,
    setAutoSaveCallback,
    editor,
    triggerAutoSave,
  } = useCodeEditorStore();

  const snippetId = params.id as string;

  // Fetch snippet data and check permissions
  const fetchSnippetData = async () => {
    try {
      setLoading(true);
      const snippetData = await getSnippetWithCollaborators(snippetId);

      if (!snippetData) {
        setError("Snippet not found");
        return;
      }

      // Check edit permissions
      const permissions = await checkSnippetEditPermission(snippetId);

      if (!permissions.canEdit) {
        setError("You don't have permission to edit this snippet");
        return;
      }

      setSnippet(snippetData);
      setCanEdit(permissions.canEdit);
      setIsOwner(permissions.isOwner);

      // Set the language in the editor
      setLanguage(snippetData.language);

      // Set up auto-saving with collaboration check
      setCurrentSnippetId(snippetId);
      setAutoSaveCallback(async (code: string) => {
        try {
          await updateSnippetCodeWithCollaboratorCheck(snippetId, code);
          console.log("Auto-saved successfully");
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      });
    } catch (err: any) {
      console.error("Error fetching snippet:", err);
      setError(err.message || "Failed to load snippet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchSnippetData();
    } else if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [snippetId, user, isLoaded, router]);

  // Set up editor with snippet code when editor is ready
  useEffect(() => {
    if (editor && snippet) {
      // Clear any existing code first
      // const currentCode = editor.getValue();
      // if (currentCode !== snippet.code) {
      //   editor.setValue(snippet.code);
      // }

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

  const handleCollaboratorsUpdate = () => {
    fetchSnippetData(); // Refresh the snippet data to get updated collaborators
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
  if (!isLoaded || !user || !canEdit) {
    return null;
  }

  return (
    <Room snippetId={snippetId}>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a0a] to-[#0a0a0f]">
        <div className="max-w-[1800px] mx-auto p-4">
          <Header
            snippetId={snippetId}
            snippetTitle={snippet?.title}
            onTitleUpdate={handleTitleUpdate}
            collaborators={snippet?.collaborators || []}
            isOwner={isOwner}
            onCollaboratorsUpdate={handleCollaboratorsUpdate}
          />

          {/* Collaboration Status */}
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="font-medium">
                {isOwner
                  ? `You own this snippet • ${
                      snippet?.collaborators?.length || 0
                    } collaborator${
                      snippet?.collaborators?.length !== 1 ? "s" : ""
                    }`
                  : "You're collaborating on this snippet"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EditorPanel />
            <OutputPanel />
          </div>
        </div>
      </div>
    </Room>
  );
}
