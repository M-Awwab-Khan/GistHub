"use client";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { MessageSquare } from "lucide-react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import { getSnippetComments, addComment, deleteComment } from "@/lib/actions";

interface CommentType {
  id: string;
  snippetId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

function Comments({ snippetId }: { snippetId: string }) {
  const { user } = useUser();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );

  // Fetch comments on component mount and when snippetId changes
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const fetchedComments = await getSnippetComments(snippetId);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast.error("Failed to load comments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [snippetId]);

  const handleSubmitComment = async (content: string) => {
    setIsSubmitting(true);

    try {
      const newComment = await addComment({ snippetId, content });
      setComments((prev) => [newComment, ...prev]);
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      toast.success("Comment deleted!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-[#ffffff0a]">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Discussion ({comments.length})
        </h2>
      </div>

      <div className="p-6 sm:p-8">
        {user ? (
          <CommentForm
            onSubmit={handleSubmitComment}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="bg-[#0a0a0f] rounded-xl p-6 text-center mb-8 border border-[#ffffff0a]">
            <p className="text-[#808086] mb-4">
              Sign in to join the discussion
            </p>
            <SignInButton mode="modal">
              <button className="px-6 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        )}

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#808086] mt-2">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#808086]">
                No comments yet. Be the first to start the discussion!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={{
                  id: comment.id,
                  createdAt: new Date(comment.createdAt).getTime(),
                  userId: comment.userId,
                  userName: comment.userName,
                  snippetId: comment.snippetId,
                  content: comment.content,
                }}
                onDelete={handleDeleteComment}
                isDeleting={deletingCommentId === comment.id}
                currentUserId={user?.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
export default Comments;
