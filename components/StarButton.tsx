"use client";

import { useAuth } from "@clerk/nextjs";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import {
  toggleStarSnippet,
  getSnippetStarCount,
  isSnippetStarred,
} from "@/lib/actions";
import toast from "react-hot-toast";

interface StarButtonProps {
  snippetId: string;
  initialStarCount?: number;
  initialIsStarred?: boolean;
}

function StarButton({
  snippetId,
  initialStarCount = 0,
  initialIsStarred = false,
}: StarButtonProps) {
  const { isSignedIn } = useAuth();
  const [isStarred, setIsStarred] = useState(initialIsStarred);
  const [starCount, setStarCount] = useState(initialStarCount);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data if not provided
  useEffect(() => {
    const fetchStarData = async () => {
      try {
        const [starred, count] = await Promise.all([
          isSnippetStarred(snippetId),
          getSnippetStarCount(snippetId),
        ]);
        setIsStarred(starred);
        setStarCount(count);
      } catch (error) {
        console.error("Error fetching star data:", error);
      }
    };

    // Only fetch if we don't have initial data
    if (initialStarCount === 0 && !initialIsStarred) {
      fetchStarData();
    }
  }, [snippetId, initialStarCount, initialIsStarred]);

  const handleStar = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to star snippets");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const result = await toggleStarSnippet(snippetId);

      // Optimistically update the UI
      setIsStarred(result.starred);
      setStarCount((prev) => (result.starred ? prev + 1 : prev - 1));

      toast.success(result.starred ? "Snippet starred!" : "Snippet unstarred!");
    } catch (error) {
      console.error("Error toggling star:", error);
      toast.error("Failed to update star. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
    transition-all duration-200 disabled:opacity-50 ${
      isStarred
        ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
        : "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
    }`}
      onClick={handleStar}
      disabled={isLoading}
    >
      <Star
        className={`w-4 h-4 transition-all ${
          isStarred ? "fill-yellow-500" : "fill-none group-hover:fill-gray-400"
        } ${isLoading ? "animate-pulse" : ""}`}
      />
      <span
        className={`text-xs font-medium ${
          isStarred ? "text-yellow-500" : "text-gray-400"
        }`}
      >
        {starCount}
      </span>
    </button>
  );
}

export default StarButton;
