import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  getSnippetWithCollaborators,
  checkSnippetEditPermission,
} from "@/lib/actions";
import { Snippet, SnippetCollaborator } from "@/types";
import EditPageClient from "./EditPageClient";

interface SnippetWithCollaborators extends Snippet {
  collaborators: SnippetCollaborator[];
}

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditSnippetPage({ params }: PageProps) {
  const { userId } = await auth();

  // Redirect unauthenticated users immediately
  if (!userId) {
    redirect("/sign-in");
  }

  const snippetId = params.id;

  try {
    // Fetch data server-side in parallel
    const [snippetData, permissions] = await Promise.all([
      getSnippetWithCollaborators(snippetId),
      checkSnippetEditPermission(snippetId),
    ]);

    // Handle not found
    if (!snippetData) {
      notFound();
    }

    // Handle no edit permission
    if (!permissions.canEdit) {
      redirect("/snippets");
    }

    // Pass all data to client component
    return (
      <EditPageClient
        snippet={snippetData}
        isOwner={permissions.isOwner}
        canEdit={permissions.canEdit}
      />
    );
  } catch (error) {
    console.error("Error loading snippet:", error);
    notFound();
  }
}
