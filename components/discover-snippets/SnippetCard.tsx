"use client";
import { Snippet } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Trash2, User } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import StarButton from "@/components/StarButton";
import { deleteSnippet } from "@/lib/actions";
import { useRouter } from "next/navigation";
import CodeBlock from "../profile/CodeBlock";

function SnippetCard({ snippet }: { snippet: Snippet }) {
  const { user } = useUser();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!user?.id || user.id !== snippet.userId) {
      toast.error("Unauthorized");
      return;
    }

    setIsDeleting(true);

    startTransition(async () => {
      try {
        await deleteSnippet(snippet.id);
        toast.success("Snippet deleted successfully");
        router.refresh(); // Refresh the page to update the snippets list
      } catch (error) {
        console.log("Error deleting snippet:", error);
        toast.error("Error deleting snippet");
      } finally {
        setIsDeleting(false);
      }
    });
  };

  return (
    <motion.div
      layout
      className="group relative"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/snippets/${snippet.id}`} className="h-full block">
        <div
          className="relative h-full bg-[#1e1e2e]/80 backdrop-blur-sm rounded-xl 
          border border-[#313244]/50 hover:border-[#313244] 
          transition-all duration-300 overflow-hidden"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="relative p-2 rounded-lg 
                   "
                  >
                    <Image
                      src={`/${snippet.language}.png`}
                      alt={`${snippet.language} logo`}
                      className="w-6 h-6 object-contain relative z-10"
                      width={24}
                      height={24}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="flex items-center justify-center px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-medium">
                    {snippet.language}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="size-3" />
                    {new Date(snippet.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div
                className="absolute top-5 right-5 z-10 flex gap-4 items-center"
                onClick={(e) => e.preventDefault()}
              >
                <StarButton snippetId={snippet.id} />

                {user?.id === snippet.userId && (
                  <div className="z-10" onClick={(e) => e.preventDefault()}>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting || isPending}
                      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200
                                  ${
                                    isDeleting || isPending
                                      ? "bg-red-500/20 text-red-400 cursor-not-allowed"
                                      : "bg-gray-500/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                                  }
                                `}
                    >
                      {isDeleting || isPending ? (
                        <div className="size-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
                  {snippet.title}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-gray-800/50">
                      <User className="size-3" />
                    </div>
                    <span className="truncate max-w-[150px]">
                      {snippet.userName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative group/code">
                <CodeBlock code={snippet.code} language={snippet.language} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
export default SnippetCard;
