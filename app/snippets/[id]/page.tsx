import { notFound } from "next/navigation";
import NavigationHeader from "@/components/NavigationHeader";
import { Clock, Code, MessageSquare, User } from "lucide-react";
import CopyButton from "@/components/snippet/CopyButton";
import Comments from "@/components/snippet/Comments";
import ClientEditor from "@/components/snippet/ClientEditor";
import ShareSnippetButton from "@/components/snippet/ShareSnippetButton";
import { getSnippetWithAccess, getSnippetComments } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<{ title: string }> {
  const snippetId = (await params).id;

  try {
    const snippet = await getSnippetWithAccess(snippetId);

    if (!snippet) {
      return { title: "Snippet Not Found" };
    }

    return {
      title: `Snippet: ${snippet.title}`,
    };
  } catch (error) {
    console.error("Error fetching snippet metadata:", error);
    return { title: "Error Loading Snippet" };
  }
}

async function SnippetDetailPage({ params }: PageProps) {
  const snippetId = (await params).id;

  try {
    const { userId } = await auth();
    const [snippet, comments] = await Promise.all([
      getSnippetWithAccess(snippetId),
      getSnippetComments(snippetId),
    ]);

    if (!snippet) {
      notFound();
    }

    const isOwner = userId === snippet.userId;

    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <NavigationHeader />

        <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl p-6 sm:p-8 mb-6 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center size-12 rounded-xl bg-[#ffffff08] p-2.5">
                    <img
                      src={`/${snippet.language}.png`}
                      alt={`${snippet.language} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                      {snippet.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[#8b8b8d]">
                        <User className="w-4 h-4" />
                        <span>{snippet.userName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8b8b8d]">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(snippet.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8b8b8d]">
                        <MessageSquare className="w-4 h-4" />
                        <span>{comments.length} comments</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!snippet.public && (
                    <div className="inline-flex items-center px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-sm font-medium border border-amber-500/20">
                      Private
                    </div>
                  )}
                  <div className="inline-flex items-center px-3 py-1.5 bg-[#ffffff08] text-[#808086] rounded-lg text-sm font-medium">
                    {snippet.language}
                  </div>
                  <ShareSnippetButton
                    snippetId={snippet.id}
                    isPublic={snippet.public}
                    isOwner={isOwner}
                  />
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="mb-8 rounded-2xl overflow-hidden border border-[#ffffff0a] bg-[#121218]">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#ffffff0a]">
                <div className="flex items-center gap-2 text-[#808086]">
                  <Code className="w-4 h-4" />
                  <span className="text-sm font-medium">Source Code</span>
                </div>
                <CopyButton code={snippet.code} />
              </div>
              <ClientEditor code={snippet.code} language={snippet.language} />
            </div>

            <Comments snippetId={snippet.id} />
          </div>
        </main>
      </div>
    );
  } catch (error: any) {
    if (error.message?.includes("Access denied")) {
      return (
        <div className="min-h-screen bg-[#0a0a0f]">
          <NavigationHeader />
          <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-white mb-4">
                Access Denied
              </h1>
              <p className="text-[#808086]">
                This snippet is private and can only be viewed by its author.
              </p>
            </div>
          </main>
        </div>
      );
    }

    console.error("Error fetching snippet:", error);
    notFound();
  }
}

export default SnippetDetailPage;
