import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  getSnippetWithCollaborators,
  checkSnippetEditPermission,
} from "@/lib/actions";
import { Snippet, SnippetCollaborator } from "@/types";
import { Room } from "./Room";
import Header from "@/components/create-snippet/Header";
import EditorPanel from "@/components/create-snippet/EditorPanel";
import OutputPanel from "@/components/create-snippet/OutputPanel";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";
import { Metadata } from "next";

interface SnippetWithCollaborators extends Snippet {
  collaborators: SnippetCollaborator[];
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { userId } = await auth();

  if (!userId) {
    return {
      title: "Sign In Required",
    };
  }

  try {
    const snippetData = await getSnippetWithCollaborators((await params).id);
    const snippet = snippetData as SnippetWithCollaborators;

    if (!snippet) {
      return {
        title: "Snippet Not Found",
      };
    }

    return {
      title: `Edit: ${snippet.title}`,
    };
  } catch (error) {
    return {
      title: "Error Loading Snippet",
    };
  }
}

export default async function EditSnippetPage({ params }: PageProps) {
  const { userId } = await auth();

  // Redirect unauthenticated users immediately
  if (!userId) {
    redirect("/sign-in");
  }

  const snippetId = (await params).id;

  try {
    // Fetch data server-side in parallel
    const [snippetData, permissions] = await Promise.all([
      getSnippetWithCollaborators(snippetId),
      checkSnippetEditPermission(snippetId),
    ]);
    const snippet = snippetData as SnippetWithCollaborators;
    const { isOwner } = permissions;

    // Handle not found
    if (!snippetData) {
      notFound();
    }

    // Handle no edit permission
    if (!permissions.canEdit) {
      redirect("/snippets");
    }

    return (
      <Room snippetId={snippet.id}>
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a0a] to-[#0a0a0f]">
          <div className="max-w-[1800px] mx-auto p-4">
            <Header
              snippetId={snippet.id}
              snippetTitle={snippet.title}
              isOwner={isOwner}
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
                        snippet.collaborators.length
                      } collaborator${
                        snippet.collaborators.length !== 1 ? "s" : ""
                      }`
                    : "You're collaborating on this snippet"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <EditorPanel snippet={snippet} />
              <OutputPanel />
            </div>
          </div>

          {/* Floating Chat Button */}
          <FloatingChatButton />
        </div>
      </Room>
    );
  } catch (error) {
    console.error("Error loading snippet:", error);
    notFound();
  }
}
