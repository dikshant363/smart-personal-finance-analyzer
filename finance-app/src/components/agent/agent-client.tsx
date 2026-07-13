"use client";

import React, { useState, useEffect } from "react";

export default function AgentClient() {
  const [agents, setAgents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("financial-review");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);

  // New Chat Session title
  const [chatTitle, setChatTitle] = useState("");

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      const [resAgents, resSessions] = await Promise.all([
        fetch("/api/agents"),
        fetch("/api/agents/chat"),
      ]);

      const dataAgents = await resAgents.json();
      const dataSessions = await resSessions.json();

      setAgents(dataAgents.agents || []);
      setSessions(dataSessions.sessions || []);
      if (dataSessions.sessions?.length > 0 && !selectedSessionId) {
        setSelectedSessionId(dataSessions.sessions[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    if (!chatTitle) return;

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: chatTitle }),
      });

      if (res.ok) {
        setChatTitle("");
        const data = await res.json();
        await fetchInitialData();
        setSelectedSessionId(data.session.id);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText || !selectedSessionId) return;

    try {
      // Add local message instantly
      const textToSubmit = messageText;
      setMessageText("");

      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedSessionId,
          agentId: selectedAgentId,
          message: textToSubmit,
        }),
      });

      if (res.ok) {
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleFeedback(messageId: string, type: "Like" | "Dislike") {
    try {
      await fetch("/api/agents/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, feedback: type }),
      });
      fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 animate-pulse text-lg">Orchestrating agent runtimes...</p>
      </div>
    );
  }

  const activeSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar - Agents Grid & Chat List */}
      <div className="lg:col-span-1 space-y-6">
        {/* Available Agents Selector */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">AI Agents</h4>
          <div className="space-y-1">
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAgentId(a.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${
                  selectedAgentId === a.id
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                }`}
              >
                <p className="font-bold">{a.name}</p>
                <p className={`text-[10px] mt-0.5 ${selectedAgentId === a.id ? "text-indigo-100" : "text-slate-400"}`}>
                  {a.supportedModule} Module
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Sessions list */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">Conversations</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSessionId(s.id)}
                className={`w-full text-left p-2 rounded text-xs transition-colors ${
                  selectedSessionId === s.id
                    ? "bg-slate-100 text-slate-950 font-bold dark:bg-slate-700 dark:text-slate-100"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {s.title}
              </button>
            ))}
            {sessions.length === 0 && (
              <p className="text-slate-400 text-center py-4">No active chat sessions.</p>
            )}
          </div>

          <form onSubmit={handleCreateSession} className="flex gap-1 border-t border-slate-100 dark:border-slate-700 pt-3">
            <input
              type="text"
              value={chatTitle}
              onChange={(e) => setChatTitle(e.target.value)}
              placeholder="Session Title..."
              className="flex-1 px-3 py-1 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-xs"
              required
            />
            <button type="submit" className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-semibold px-2 py-1 rounded text-[10px]">
              + New
            </button>
          </form>
        </div>
      </div>

      {/* Main chat log console */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col justify-between h-[500px]">
        {activeSession ? (
          <>
            {/* Header info */}
            <div className="border-b border-slate-100 dark:border-slate-700 pb-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeSession.title}</span>
                <span className="text-slate-400 ml-2">({selectedAgentId} Active)</span>
              </div>
            </div>

            {/* Chat messages list */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 my-4">
              {activeSession.messages?.map((m: any) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-4 rounded-xl text-xs max-w-xl space-y-2 shadow-sm ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700"
                  }`}>
                    {m.agentType && m.role === "assistant" && (
                      <span className="inline-block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {m.agentType}
                      </span>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    {m.role === "assistant" && (
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200/50">
                        <span>Tokens: {m.tokenUsage || 0}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFeedback(m.id, "Like")}
                            className={`hover:text-indigo-600 ${m.feedback === "Like" ? "text-indigo-600 font-bold" : ""}`}
                          >
                            Like
                          </button>
                          <button
                            onClick={() => handleFeedback(m.id, "Dislike")}
                            className={`hover:text-rose-600 ${m.feedback === "Dislike" ? "text-rose-600 font-bold" : ""}`}
                          >
                            Dislike
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {activeSession.messages?.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-12">No messages. Type a query to start conversation.</p>
              )}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ask active agent..."
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-xs"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg text-xs transition-colors shadow-sm"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-slate-500">Create a session on the left to start orchestrating specialized agent queries.</p>
          </div>
        )}
      </div>
    </div>
  );
}
