"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListVideo, Loader2, Plus, Star } from "lucide-react";

const TABS = [
  {
    id: "executions",
    label: "Code Executions",
    icon: ListVideo,
  },
  {
    id: "starred",
    label: "Starred Snippets",
    icon: Star,
  },
];

interface ProfileTabsProps {
  executionsContent: React.ReactNode;
  starredContent: React.ReactNode;
}

export default function ProfileTabs({
  executionsContent,
  starredContent,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"executions" | "starred">(
    "executions"
  );
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div
      className="bg-gradient-to-br from-[#12121a] to-[#1a1a2e] rounded-3xl shadow-2xl 
      shadow-black/50 border border-gray-800/50 backdrop-blur-xl overflow-hidden"
    >
      {/* Tabs */}
      <div className="border-b border-gray-800/50 flex justify-between items-center">
        <div className="flex space-x-1 p-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "executions" | "starred")}
              className={`group flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden ${
                activeTab === tab.id
                  ? "text-orange-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-orange-500/10 rounded-lg"
                  transition={{
                    type: "spring",
                    bounce: 0.2,
                    duration: 0.6,
                  }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="text-sm font-medium relative z-10">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Create Snippet Button */}
        <div className="p-4">
          <motion.button
            onClick={() => {}}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
        group relative inline-flex items-center gap-2.5 px-5 py-2.5
        disabled:cursor-not-allowed
        focus:outline-none
        cursor-pointer
      `}
          >
            {/* bg wit gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl opacity-100 transition-opacity group-hover:opacity-90" />

            <div className="relative flex items-center gap-2.5">
              {isCreating ? (
                <>
                  <div className="relative">
                    <Loader2 className="w-4 h-4 animate-spin text-white/70" />
                    <div className="absolute inset-0 blur animate-pulse" />
                  </div>
                  <span className="text-sm font-medium text-white/90">
                    Creating...
                  </span>
                </>
              ) : (
                <>
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <Plus className="w-4 h-4 text-white/90 transition-transform group-hover:scale-110 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/90 group-hover:text-white">
                    Create Snippet
                  </span>
                </>
              )}
            </div>
          </motion.button>
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          {activeTab === "executions" ? executionsContent : starredContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
