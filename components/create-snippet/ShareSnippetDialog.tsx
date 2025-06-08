import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useState } from "react";
import { Copy, Globe, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { createSnippet } from "@/lib/actions";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShareSnippetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ShareSnippetDialog({ open, onOpenChange }: ShareSnippetDialogProps) {
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [sharedSnippetId, setSharedSnippetId] = useState<string | null>(null);
  const { language, getCode } = useCodeEditorStore();
  const { user } = useUser();
  const router = useRouter();

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to share snippets");
      return;
    }

    setIsSharing(true);

    try {
      const code = getCode();
      const snippetId = await createSnippet({
        title,
        language,
        code,
        userId: user.id,
        userName:
          user.fullName ||
          user.primaryEmailAddress?.emailAddress ||
          "Anonymous",
        isPublic,
      });

      setSharedSnippetId(snippetId);

      if (isPublic) {
        const publicUrl = `${window.location.origin}/snippets/${snippetId}`;
        await navigator.clipboard.writeText(publicUrl);
        toast.success("Public link copied to clipboard!");
      } else {
        toast.success("Private snippet created successfully!");
      }

      // Reset form
      setTitle("");
      setIsPublic(false);
    } catch (error) {
      console.log("Error creating snippet:", error);
      toast.error("Error creating snippet");
    } finally {
      setIsSharing(false);
    }
  };

  const copyPublicLink = async () => {
    if (sharedSnippetId && isPublic) {
      const publicUrl = `${window.location.origin}/snippets/${sharedSnippetId}`;
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const viewSnippet = () => {
    if (sharedSnippetId) {
      router.push(`/snippets/${sharedSnippetId}`);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setTitle("");
      setIsPublic(false);
      setSharedSnippetId(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1e1e2e] border-[#313244]">
        <DialogHeader>
          <DialogTitle className="text-white">Share Snippet</DialogTitle>
          <DialogDescription className="text-gray-400">
            {!sharedSnippetId
              ? "Create a new snippet from your current code"
              : "Your snippet has been created successfully"}
          </DialogDescription>
        </DialogHeader>

        {!sharedSnippetId ? (
          <form onSubmit={handleShare} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter snippet title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Visibility
              </label>
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    !isPublic
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-[#313244] bg-[#181825]"
                  }`}
                  onClick={() => setIsPublic(false)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        !isPublic ? "border-orange-500" : "border-gray-400"
                      }`}
                    >
                      {!isPublic && (
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
                    isPublic
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-[#313244] bg-[#181825]"
                  }`}
                  onClick={() => setIsPublic(true)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isPublic ? "border-orange-500" : "border-gray-400"
                      }`}
                    >
                      {isPublic && (
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
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSharing}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isSharing ? "Creating..." : "Create Snippet"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Copy className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Snippet Created Successfully!
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {isPublic
                ? "Your public snippet link has been copied to clipboard"
                : "Your private snippet has been created"}
            </p>

            <div className="flex gap-3">
              {isPublic && (
                <Button
                  onClick={copyPublicLink}
                  variant="outline"
                  className="flex-1 border-[#313244] bg-[#181825] text-white hover:bg-[#313244]"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              )}
              <Button
                onClick={viewSnippet}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                View Snippet
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
export default ShareSnippetDialog;
