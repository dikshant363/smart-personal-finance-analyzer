"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Plus,
  Send,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  HelpCircle,
} from "lucide-react";

type Conversation = {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Message = {
  id: string;
  role: string;
  content: string;
  feedback: string | null;
  createdAt: string | Date;
};

export function CopilotClient({
  initialConversations,
  initialMessages,
}: {
  initialConversations: Conversation[];
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [conversations, setConversations] = React.useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = React.useState(conversations[0]?.id || "");
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  
  const [prompt, setPrompt] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  // Suggestions list
  const suggestions = [
    "What is my Debt Health Score?",
    "Summarize my net worth assets",
    "Explain my portfolio accounts",
  ];

  async function handleSelectThread(id: string) {
    setActiveId(id);
    const res = await fetch(`/api/copilot/chat?conversationId=${id}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages ?? []);
    }
  }

  async function handleCreateThread() {
    const res = await fetch("/api/copilot/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Advisory Chat" }),
    });

    if (res.ok) {
      const data = await res.json();
      const updated = await fetch("/api/copilot/history");
      const list = await updated.json();
      setConversations(list.conversations ?? []);
      handleSelectThread(data.conversation.id);
    }
  }

  async function handleSend(promptText: string) {
    if (!promptText.trim()) return;
    setIsSending(true);
    setPrompt("");

    const res = await fetch("/api/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeId, prompt: promptText }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages ?? []);
      
      // Refresh thread updated timestamp list
      const updated = await fetch("/api/copilot/history");
      const list = await updated.json();
      setConversations(list.conversations ?? []);
    }
    setIsSending(false);
  }

  async function handleFeedback(messageId: string, rating: "Like" | "Dislike") {
    const res = await fetch("/api/copilot/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, feedback: rating }),
    });

    if (res.ok) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, feedback: rating } : msg))
      );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Sidebar: conversation history list */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-semibold">Chats History</CardTitle>
            <button
              onClick={handleCreateThread}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-indigo-600"
              title="New Conversation"
            >
              <Plus className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[400px] overflow-y-auto p-2">
            {conversations.map((c) => {
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectThread(c.id)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-colors",
                    isActive
                      ? "border-indigo-500 bg-indigo-50/20 text-indigo-900 dark:text-indigo-100"
                      : "border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                  )}
                >
                  <MessageSquare className="h-4 w-4 text-neutral-400 shrink-0" />
                  <span className="truncate font-semibold">{c.title}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Main chat window */}
      <div className="lg:col-span-3 space-y-4 flex flex-col h-[520px] border border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-900/10 rounded-2xl p-4 text-xs">
        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 max-w-sm mx-auto space-y-3">
              <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse" />
              <p className="font-semibold text-neutral-600 dark:text-neutral-300">Start an Advisory Conversation</p>
              <p className="text-[10px] leading-relaxed">Ask questions regarding your financial health, net worth projections, asset/liability logs, or portfolio distribution.</p>
            </div>
          )}
          
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed space-y-1.5 relative",
                  isUser
                    ? "bg-indigo-600 text-white self-end rounded-tr-none"
                    : "bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 self-start rounded-tl-none text-neutral-800 dark:text-neutral-100 shadow-sm"
                )}
              >
                <span className="font-semibold text-[8px] uppercase tracking-wider block opacity-75">
                  {isUser ? "You" : "Antigravity Assistant"}
                </span>
                <p className="whitespace-pre-line">{msg.content}</p>

                {/* Rating actions for assistant */}
                {!isUser && (
                  <div className="flex justify-end gap-2 pt-1 border-t border-dashed mt-2">
                    <button
                      onClick={() => handleFeedback(msg.id, "Like")}
                      className={cn(
                        "p-1 hover:text-green-600 transition-colors",
                        msg.feedback === "Like" ? "text-green-600" : "text-neutral-300"
                      )}
                      title="Rate helpful"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, "Dislike")}
                      className={cn(
                        "p-1 hover:text-red-500 transition-colors",
                        msg.feedback === "Dislike" ? "text-red-500" : "text-neutral-300"
                      )}
                      title="Rate unhelpful"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Suggested prompts list */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="px-2.5 py-1.5 border border-neutral-100 hover:border-indigo-500 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 hover:bg-indigo-50/10 text-left transition-all font-semibold"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(prompt);
          }}
          className="flex gap-2 pt-2 border-t"
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isSending || !activeId}
            placeholder={activeId ? "Ask AI copilot regarding health score or net worth..." : "Select or create chat thread first..."}
            className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
          <Button
            type="submit"
            disabled={isSending || !prompt.trim() || !activeId}
            className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
