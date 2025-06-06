import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock, Star } from "lucide-react";
import StarButton from "@/components/StarButton";

interface StarredSnippetsListProps {
  starredSnippets: Array<{
    id: string;
    title: string;
    language: string;
    code: string;
    userName: string;
    createdAt: Date;
  }>;
}

export default function StarredSnippetsList({
  starredSnippets,
}: StarredSnippetsListProps) {
  if (starredSnippets.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">
          No starred snippets yet
        </h3>
        <p className="text-gray-500">
          Start exploring and star the snippets you find useful!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {starredSnippets.map((snippet) => (
        <div key={snippet.id} className="group relative">
          <Link href={`/snippets/${snippet.id}`}>
            <div
              className="bg-black/20 rounded-xl border border-gray-800/50 hover:border-gray-700/50 
              transition-all duration-300 overflow-hidden h-full group-hover:transform
            group-hover:scale-[1.02]"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity" />
                      <Image
                        src={`/${snippet.language}.png`}
                        alt={`${snippet.language} logo`}
                        className="relative z-10"
                        width={40}
                        height={40}
                      />
                    </div>
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-sm">
                      {snippet.language}
                    </span>
                  </div>
                  <div
                    className="absolute top-6 right-6 z-10"
                    onClick={(e) => e.preventDefault()}
                  >
                    <StarButton snippetId={snippet.id} />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white mb-3 line-clamp-1 group-hover:text-orange-400 transition-colors">
                  {snippet.title}
                </h2>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{snippet.createdAt.toLocaleDateString()}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="bg-black/30 rounded-lg p-4 overflow-hidden">
                  <pre className="text-sm text-gray-300 font-mono line-clamp-3">
                    {snippet.code}
                  </pre>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
