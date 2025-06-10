"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Edit3, Check, X } from "lucide-react";
import { updateSnippetTitleWithCollaboratorCheck } from "@/lib/actions";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import toast from "react-hot-toast";

interface TitleEditorProps {
  snippetId: string;
  initialTitle: string;
}

export default function TitleEditor({
  snippetId,
  initialTitle,
}: TitleEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSaving } = useCodeEditorStore();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      setTitle(initialTitle);
      setIsEditing(false);
      return;
    }

    if (title.trim() === initialTitle) {
      setIsEditing(false);
      return;
    }

    setSaving(true, "Saving title...");
    try {
      await updateSnippetTitleWithCollaboratorCheck(snippetId, title.trim());
      // onTitleUpdate(title.trim());
      setIsEditing(false);
      setSaving(false, "Title Saved");
      toast.success("Title updated successfully");

      // Clear the success message after 2 seconds
      setTimeout(() => setSaving(false), 2000);
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
      setTitle(initialTitle);
      setSaving(false, "Save failed");
      setTimeout(() => setSaving(false), 2000);
    }
  };

  const handleCancel = () => {
    setTitle(initialTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-1.5 bg-[#181825] border border-orange-500/50 rounded-lg text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          maxLength={100}
        />
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCancel}
            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => setIsEditing(true)}
      whileHover={{ scale: 1.02 }}
      className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-800/50 transition-colors max-w-md"
    >
      <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
      <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
