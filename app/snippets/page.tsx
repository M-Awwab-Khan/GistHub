import { Suspense } from "react";
import { ArrowRightIcon, BookOpen, Code, X } from "lucide-react";
import NavigationHeader from "@/components/NavigationHeader";
import SnippetsPageSkeleton from "@/components/discover-snippets/SnippetsPageSkeleton";
import SnippetCard from "@/components/discover-snippets/SnippetCard";
import SearchAndFilters from "@/components/discover-snippets/SearchAndFilters";
import Pagination from "@/components/discover-snippets/Pagination";
import { getPublicSnippets, getAvailableLanguages } from "@/lib/actions";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { cn } from "@/lib/utils";

interface SnippetsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    language?: string;
    view?: "grid" | "list";
  }>;
}

export default async function SnippetsPage({
  searchParams,
}: SnippetsPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const search = resolvedSearchParams.search || "";
  const language = resolvedSearchParams.language || "";
  const view = resolvedSearchParams.view || "grid";

  // Fetch data in parallel
  const [snippetsData, availableLanguages] = await Promise.all([
    getPublicSnippets({
      page,
      limit: 9,
      search,
      language,
    }),
    getAvailableLanguages(),
  ]);

  const { snippets, pagination } = snippetsData;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavigationHeader />

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="z-10 flex min-h-16 mb-2 items-center justify-center">
            <div
              className={cn(
                "group rounded-full border border-orange-500/20 bg-orange-500/10 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-orange-500/20 dark:border-orange-500/20 dark:bg-orange-500/10 dark:hover:bg-orange-500/20"
              )}
            >
              <AnimatedShinyText className="gap-2 inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-orange-300 hover:duration-300 hover:dark:text-orange-300">
                <BookOpen className="size-4" />
                <span>Community Code Library</span>
              </AnimatedShinyText>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text mb-6">
            Discover & Share Code Snippets
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Explore a curated collection of code snippets from the community
          </p>
        </div>

        {/* Search and Filters */}
        <Suspense
          fallback={
            <div className="h-32 animate-pulse bg-[#1e1e2e] rounded-xl mb-12" />
          }
        >
          <SearchAndFilters
            availableLanguages={availableLanguages}
            totalCount={pagination.totalCount}
            currentView={view as "grid" | "list"}
          />
        </Suspense>

        {/* Snippets Grid */}
        <div
          className={`grid gap-6 ${
            view === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 max-w-3xl mx-auto"
          }`}
        >
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>

        {/* Empty state */}
        {snippets.length === 0 && (
          <div className="relative max-w-md mx-auto mt-20 p-8 rounded-2xl overflow-hidden">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 ring-1 ring-white/10 mb-6">
                <Code className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">
                No snippets found
              </h3>
              <p className="text-gray-400 mb-6">
                {search || language
                  ? "Try adjusting your search query or filters"
                  : "Be the first to share a code snippet with the community"}
              </p>

              {(search || language) && (
                <a
                  href="/snippets"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#262637] text-gray-300 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </a>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {snippets.length > 0 && (
          <Suspense fallback={<div className="h-12 mt-12" />}>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
