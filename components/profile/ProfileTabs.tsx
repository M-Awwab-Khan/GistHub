"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListVideo, Star } from "lucide-react";

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

  return (
    <div
      className="bg-gradient-to-br from-[#12121a] to-[#1a1a2e] rounded-3xl shadow-2xl 
      shadow-black/50 border border-gray-800/50 backdrop-blur-xl overflow-hidden"
    >
      {/* Tabs */}
      <div className="border-b border-gray-800/50">
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
