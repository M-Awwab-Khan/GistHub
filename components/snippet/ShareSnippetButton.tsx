"use client";

import { useState } from "react";
import { Share2, Globe, Lock, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { toggleSnippetVisibility } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShareSnippetButtonProps {
  snippetId: string;
  isPublic: boolean;
  isOwner: boolean;
}

function ShareSnippetButton({
  snippetId,
  isPublic,
  isOwner,
}: ShareSnippetButtonProps) {
  const [open, setOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [currentlyPublic, setCurrentlyPublic] = useState(isPublic);

  const handleToggleVisibility = async () => {
    setIsToggling(true);

    try {
      const result = await toggleSnippetVisibility(snippetId);
      setCurrentlyPublic(result.isPublic);

      if (result.isPublic && result.publicUrl) {
        await navigator.clipboard.writeText(result.publicUrl);
        toast.success("Made public and link copied to clipboard!");
      } else {
        toast.success("Made private");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to update snippet visibility");
    } finally {
      setIsToggling(false);
    }
  };

  const copyPublicLink = async () => {
    const publicUrl = `${window.location.origin}/snippets/${snippetId}`;
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Link copied to clipboard!");
  };

  if (!isOwner) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-[#ffffff08] border-[#ffffff0a] text-[#808086] hover:bg-[#ffffff12] hover:text-white"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Share</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#1e1e2e] border-[#313244]">
        <DialogHeader>
          <DialogTitle className="text-white">Share Snippet</DialogTitle>
          <DialogDescription className="text-gray-400">
            Manage your snippet's visibility and sharing settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                !currentlyPublic
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-[#313244] bg-[#181825]"
              }`}
              onClick={() => !currentlyPublic || handleToggleVisibility()}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    !currentlyPublic ? "border-orange-500" : "border-gray-400"
                  }`}
                >
                  {!currentlyPublic && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </div>
                <Lock className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-white font-medium">Private</div>
                  <div className="text-sm text-gray-400">
                    Only you can see this snippet
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                currentlyPublic
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-[#313244] bg-[#181825]"
              }`}
              onClick={() => currentlyPublic || handleToggleVisibility()}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    currentlyPublic ? "border-orange-500" : "border-gray-400"
                  }`}
                >
                  {currentlyPublic && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </div>
                <Globe className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-white font-medium">Public</div>
                  <div className="text-sm text-gray-400">
                    Anyone with the link can see this
                  </div>
                </div>
              </div>
            </div>
          </div>

          {currentlyPublic && (
            <div className="mt-4 p-3 bg-[#181825] rounded-lg border border-[#313244] w-full overflow-hidden text-ellipsis">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">
                    Public Link
                  </div>
                  <div className="w-full text-xs text-gray-400 ">
                    {`${window.location.origin}/snippets/${snippetId}`}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyPublicLink}
                  className="p-2 hover:bg-[#313244]"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-[#313244] bg-[#181825] text-white hover:bg-[#313244]"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ShareSnippetButton;
