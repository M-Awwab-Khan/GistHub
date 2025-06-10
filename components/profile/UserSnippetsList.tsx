"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, ChevronRight, Code2, Edit } from "lucide-react";
import CodeBlock from "./CodeBlock";

interface UserSnippetsListProps {
  userSnippets: Array<{
    id: string;
    title: string;
    language: string;
    code: string;
    userName: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export default function UserSnippetsList({
  userSnippets,
}: UserSnippetsListProps) {
  if (userSnippets.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">
          No snippets yet
        </h3>
        <p className="text-gray-500 mb-4">
          Start creating code snippets to see them here!
        </p>
        <Link
          href="/snippets/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Code2 className="w-4 h-4" />
          Create Your First Snippet
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {userSnippets.map((snippet) => (
        <div key={snippet.id} className="group relative">
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
                      width={20}
                      height={20}
                    />
                  </div>
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-sm">
                    {snippet.language}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/snippets/${snippet.id}/edit`}
                    className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <Link href={`/snippets/${snippet.id}`}>
                <h2 className="text-xl font-semibold text-white mb-3 line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {snippet.title}
                </h2>
              </Link>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(snippet.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <CodeBlock code={snippet.code} language={snippet.language} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
