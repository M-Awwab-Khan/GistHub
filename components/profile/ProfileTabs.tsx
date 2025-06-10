"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListVideo, Share2, Plus, Star, Code2 } from "lucide-react";
import Link from "next/link";

const TABS = [
  {
    id: "snippets",
    label: "Your Snippets",
    icon: Code2,
  },
  {
    id: "starred",
    label: "Starred Snippets",
    icon: Star,
  },
  {
    id: "shared",
    label: "Shared Snippets",
    icon: Share2,
  },
  {
    id: "executions",
    label: "Code Executions",
    icon: ListVideo,
  },
];

interface ProfileTabsProps {
  executionsContent: React.ReactNode;
  snippetsContent: React.ReactNode;
  starredContent: React.ReactNode;
  sharedContent: React.ReactNode;
}

export default function ProfileTabs({
  executionsContent,
  snippetsContent,
  starredContent,
  sharedContent,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "executions" | "snippets" | "starred" | "shared"
  >("snippets");

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-800/50 bg-gradient-to-br from-[#12121a] to-[#1a1a2e] shadow-2xl shadow-black/50 backdrop-blur-xl">
      {/* Tabs */}
      <div className="flex justify-between border-b border-gray-800/50">
        <div className="flex space-x-1 p-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "executions" | "snippets" | "starred")
              }
              className={`relative group flex items-center gap-2 rounded-lg px-6 py-2.5 transition-all duration-200 overflow-hidden ${
                activeTab === tab.id
                  ? "text-orange-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg bg-orange-500/10"
                  transition={{
                    type: "spring",
                    bounce: 0.2,
                    duration: 0.6,
                  }}
                />
              )}
              <tab.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10 text-sm font-medium">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Create Snippet Button */}
        <div className="p-4">
          <Link href="/snippets/create">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center gap-2.5 rounded-lg px-5 py-2.5 focus:outline-none cursor-pointer"
            >
              {/* bg with gradient */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 opacity-100 transition-opacity group-hover:opacity-90" />

              <div className="relative flex items-center gap-2.5">
                <div className="relative flex h-4 w-4 items-center justify-center">
                  <Plus className="h-4 w-4 text-white/90 transition-transform group-hover:scale-110 group-hover:text-white" />
                </div>
                <span className="text-sm font-medium text-white/90 group-hover:text-white">
                  Create Snippet
                </span>
              </div>
            </motion.button>
          </Link>
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
          {activeTab === "executions" && executionsContent}
          {activeTab === "snippets" && snippetsContent}
          {activeTab === "starred" && starredContent}
          {activeTab === "shared" && sharedContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
