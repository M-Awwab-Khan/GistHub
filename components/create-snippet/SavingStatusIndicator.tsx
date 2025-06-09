"use client";

import { motion } from "framer-motion";
import { Loader2, Save, Check } from "lucide-react";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";

export default function SavingStatusIndicator() {
  const { isSaving, savingMessage } = useCodeEditorStore();

  if (!isSaving && !savingMessage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
        savingMessage?.includes("Saved")
          ? "bg-green-500/10 border border-green-500/20"
          : "bg-orange-500/10 border border-orange-500/20"
      }`}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
          <span className="text-sm text-orange-400 font-medium">
            {savingMessage || "Saving..."}
          </span>
        </>
      ) : savingMessage.includes("Saved") ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-medium">
            {savingMessage}
          </span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-orange-400 font-medium">
            {savingMessage}
          </span>
        </>
      )}
    </motion.div>
  );
}
