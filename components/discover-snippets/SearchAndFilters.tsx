"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search, Tag, X, Grid, Layers } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

interface SearchAndFiltersProps {
  availableLanguages: string[];
  totalCount: number;
  currentView: "grid" | "list";
}

export default function SearchAndFilters({
  availableLanguages,
  totalCount,
  currentView,
}: SearchAndFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [view, setView] = useState<"grid" | "list">(currentView);
  const selectedLanguage = searchParams.get("language") || "";

  // Debounced search function
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to first page on search
    router.push(`/snippets?${params.toString()}`);
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Handle language filter
  const handleLanguageChange = (language: string) => {
    const params = new URLSearchParams(searchParams);
    if (language === selectedLanguage) {
      params.delete("language");
    } else {
      params.set("language", language);
    }
    params.delete("page"); // Reset to first page on filter change
    router.push(`/snippets?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    router.push("/snippets");
  };

  // Handle view change
  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView);
    const params = new URLSearchParams(searchParams);
    params.set("view", newView);
    router.push(`/snippets?${params.toString()}`);
  };

  // Popular languages (first 5)
  const popularLanguages = availableLanguages.slice(0, 5);

  return (
    <div className="relative max-w-5xl mx-auto mb-12 space-y-6">
      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search snippets by title, language, or author..."
            className="w-full pl-12 pr-4 py-4 bg-[#1e1e2e]/80 hover:bg-[#1e1e2e] text-white
              rounded-xl border border-[#313244] hover:border-[#414155] transition-all duration-200
              placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-gray-800">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Languages:</span>
        </div>

        {popularLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`
              group relative px-3 py-1.5 rounded-lg transition-all duration-200
              ${
                selectedLanguage === lang
                  ? "text-orange-400 bg-orange-500/10 ring-2 ring-orange-500/50"
                  : "text-gray-400 hover:text-gray-300 bg-[#1e1e2e] hover:bg-[#262637] ring-1 ring-gray-800"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <img
                src={`/${lang}.png`}
                alt={lang}
                className="w-4 h-4 object-contain"
              />
              <span className="text-sm">{lang}</span>
            </div>
          </button>
        ))}

        {(selectedLanguage || searchQuery) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {totalCount} snippets found
          </span>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#1e1e2e] rounded-lg ring-1 ring-gray-800">
            <button
              onClick={() => handleViewChange("grid")}
              className={`p-2 rounded-md transition-all ${
                view === "grid"
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-gray-400 hover:text-gray-300 hover:bg-[#262637]"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewChange("list")}
              className={`p-2 rounded-md transition-all ${
                view === "list"
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-gray-400 hover:text-gray-300 hover:bg-[#262637]"
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
