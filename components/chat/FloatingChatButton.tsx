"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChatCard, Message } from "./chat-card";
import { useBroadcastEvent, useEventListener, useOthers, useSelf } from "@liveblocks/react/suspense";
import { useTheme } from "next-themes";

// Define the event types properly for Liveblocks
type ChatEventData = {
  type: "MESSAGE";
  messageId: string;
  content: string;
  timestamp: string;
};

type ReactionEventData = {
  type: "REACTION";
  messageId: string;
  emoji: string;
  userId: string;
  action: "add" | "remove";
};

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { resolvedTheme } = useTheme();
  
  const broadcast = useBroadcastEvent();
  const others = useOthers();
  const self = useSelf();

  const currentUser = {
    name: self?.info?.name || "You",
    avatar: self?.info?.picture || "",
  };

  // Listen for chat messages
  useEventListener(({ event, user, connectionId }) => {
    if (!event) return;
    
    // Type guard for MESSAGE events
    if (typeof event === 'object' && 'type' in event && event.type === "MESSAGE") {
      const messageEvent = event as ChatEventData;
      const newMessage: Message = {
        id: messageEvent.messageId,
        content: messageEvent.content,
        sender: {
          name: user?.info?.name || "Anonymous",
          avatar: user?.info?.picture || "",
          isOnline: true,
          isCurrentUser: user?.id === self?.id,
        },
        timestamp: messageEvent.timestamp,
        status: "delivered",
      };

      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        if (prev.some(msg => msg.id === messageEvent.messageId)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    }

    // Type guard for REACTION events
    if (typeof event === 'object' && 'type' in event && event.type === "REACTION") {
      const reactionEvent = event as ReactionEventData;
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id === reactionEvent.messageId) {
            const existingReaction = message.reactions?.find(
              (r) => r.emoji === reactionEvent.emoji
            );
            const newReactions = message.reactions || [];
            const isCurrentUserReaction = user?.id === self?.id;

            if (existingReaction) {
              return {
                ...message,
                reactions: newReactions.map((r) =>
                  r.emoji === reactionEvent.emoji
                    ? {
                        ...r,
                        count: reactionEvent.action === "add" ? r.count + 1 : Math.max(0, r.count - 1),
                        reacted: isCurrentUserReaction 
                          ? reactionEvent.action === "add" 
                          : r.reacted,
                      }
                    : r
                ).filter(r => r.count > 0),
              };
            } else if (reactionEvent.action === "add") {
              return {
                ...message,
                reactions: [
                  ...newReactions,
                  { emoji: reactionEvent.emoji, count: 1, reacted: isCurrentUserReaction },
                ],
              };
            }
          }
          return message;
        })
      );
    }
  });

  const handleSendMessage = (content: string) => {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Add message locally first for immediate feedback
    const newMessage: Message = {
      id: messageId,
      content,
      sender: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        isOnline: true,
        isCurrentUser: true,
      },
      timestamp,
      status: "sent",
    };

    setMessages((prev) => [...prev, newMessage]);

    // Broadcast to other users - cast to the proper format
    broadcast({
      type: "MESSAGE",
      messageId,
      content,
      timestamp,
    });
  };

  const handleReaction = (messageId: string, emoji: string) => {
    // Find current reaction state
    const message = messages.find(m => m.id === messageId);
    const existingReaction = message?.reactions?.find(r => r.emoji === emoji);
    const action = existingReaction?.reacted ? "remove" : "add";

    // Update locally first
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id === messageId) {
          const existingReaction = message.reactions?.find(
            (r) => r.emoji === emoji
          );
          const newReactions = message.reactions || [];

          if (existingReaction) {
            return {
              ...message,
              reactions: newReactions.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.reacted ? Math.max(0, r.count - 1) : r.count + 1,
                      reacted: !r.reacted,
                    }
                  : r
              ).filter(r => r.count > 0),
            };
          } else {
            return {
              ...message,
              reactions: [...newReactions, { emoji, count: 1, reacted: true }],
            };
          }
        }
        return message;
      })
    );

    // Broadcast reaction
    broadcast({
      type: "REACTION",
      messageId,
      emoji,
      userId: self?.id || "",
      action,
    });
  };

  const onlineUsers = others.length + 1; // +1 for self
  const totalUsers = onlineUsers; // In a real app, you might track total vs online separately

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center",
          "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
          "transition-all duration-200 group"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        
        {/* Notification badge for new messages */}
        {messages.length > 0 && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-xs text-white font-medium">
              {messages.length > 99 ? "99+" : messages.length}
            </span>
          </motion.div>
        )}
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <div className="shadow-2xl">
              <ChatCard
                chatName="Snippet Chat"
                membersCount={totalUsers}
                onlineCount={onlineUsers}
                initialMessages={messages}
                currentUser={currentUser}
                theme={resolvedTheme as "light" | "dark"}
                onSendMessage={handleSendMessage}
                onReaction={handleReaction}
                onMoreClick={() => console.log("More options clicked")}
                className="border-2 border-white/10"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}