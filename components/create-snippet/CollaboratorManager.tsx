"use client";

import { useState } from "react";
import { addCollaborator, removeCollaborator } from "@/lib/actions";
import toast from "react-hot-toast";
import { SnippetCollaborator } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, UserPlus, UserMinus } from "lucide-react";

interface CollaboratorManagerProps {
  snippetId: string;
  collaborators: SnippetCollaborator[];
  isOwner: boolean;
  onUpdate: () => void;
  children: React.ReactNode; // This will be the trigger button
}

export default function CollaboratorManager({
  snippetId,
  collaborators,
  isOwner,
  onUpdate,
  children,
}: CollaboratorManagerProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAddCollaborator = async () => {
    if (!email.trim() || !isOwner) return;

    try {
      setLoading(true);
      await addCollaborator(snippetId, email.trim());
      setEmail("");
      onUpdate();
      toast.success("Collaborator added successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add collaborator");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!isOwner) return;

    try {
      await removeCollaborator(snippetId, userId);
      onUpdate();
      toast.success("Collaborator removed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove collaborator");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCollaborator();
    }
  };

  if (!isOwner) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Manage Collaborators
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Add or remove collaborators for this snippet. Collaborators can view
            and edit the code in real-time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Collaborator Section */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-green-400" />
              Add New Collaborator
            </h4>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter collaborator's email"
                className="flex-1 px-3 py-2 bg-gray-800/50 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <button
                onClick={handleAddCollaborator}
                disabled={loading || !email.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {/* Current Collaborators Section */}
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Current Collaborators ({collaborators.length})
            </h4>

            {collaborators.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                        {collaborator.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {collaborator.name}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {collaborator.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleRemoveCollaborator(collaborator.userId)
                      }
                      className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-200 flex items-center gap-1 border border-transparent hover:border-red-500/20"
                    >
                      <UserMinus className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  No collaborators yet. Add someone by their email address to
                  start collaborating!
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
