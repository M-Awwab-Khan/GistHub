"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Plus, Code, Loader2 } from "lucide-react";
import { createSnippet } from "@/lib/actions";
import { LANGUAGE_CONFIG } from "@/constants";
import toast from "react-hot-toast";
import Image from "next/image";

export default function CreateSnippetPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isCreating, setIsCreating] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a0a] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title for your snippet");
      return;
    }

    setIsCreating(true);

    try {
      const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
      const snippetId = await createSnippet({
        title: title.trim(),
        language,
        code: defaultCode,
        userId: user.id,
        userName: user.fullName || user.username || "Anonymous",
      });

      toast.success("Snippet created successfully!");
      router.push(`/snippets/${snippetId}/edit`);
    } catch (error) {
      console.error("Error creating snippet:", error);
      toast.error("Failed to create snippet. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a0a] to-[#0a0a0f] flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-4 rounded-xl ring-1 ring-white/10">
                <Plus className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Create New Snippet
          </h1>
          <p className="text-gray-400">
            Start coding with your favorite programming language
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0a0f]/80 backdrop-blur-xl p-8 rounded-xl border border-white/[0.05]"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300 mb-3"
              >
                Snippet Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title for your snippet"
                className="w-full px-4 py-3 bg-[#181825] border border-gray-700 rounded-lg text-white 
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                         placeholder-gray-500 transition-all"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                {title.length}/100 characters
              </p>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Programming Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(LANGUAGE_CONFIG).map((lang) => (
                  <motion.button
                    key={lang.id}
                    type="button"
                    onClick={() => setLanguage(lang.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center gap-3 p-4 rounded-lg border transition-all
                              ${
                                language === lang.id
                                  ? "border-orange-500 bg-orange-500/10 text-orange-400"
                                  : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600"
                              }`}
                  >
                    <div className="relative w-6 h-6">
                      <Image
                        src={lang.logoPath}
                        alt={`${lang.label} logo`}
                        width={24}
                        height={24}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium">{lang.label}</span>
                    {language === lang.id && (
                      <motion.div
                        className="absolute inset-0 border-2 border-orange-500/30 rounded-lg"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isCreating || !title.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 
                       bg-gradient-to-r from-orange-500 to-amber-500 text-white 
                       rounded-lg font-medium transition-all
                       hover:from-orange-600 hover:to-amber-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Snippet...
                </>
              ) : (
                <>
                  <Code className="w-5 h-5" />
                  Create Snippet
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
