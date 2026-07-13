"use client";

import React, { useState, useEffect } from "react";

export default function CollaborationClient() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<string>("");
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(true);

  // Invite Form Inputs
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Financial Planner");
  const [permTransactions, setPermTransactions] = useState(true);
  const [permInvestments, setPermInvestments] = useState(true);

  // Review Form Inputs
  const [reviewCollaboratorId, setReviewCollaboratorId] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewDescription, setReviewDescription] = useState("");
  const [reviewModule, setReviewModule] = useState("Retirement");

  useEffect(() => {
    fetchCollaborationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCollaborationData() {
    try {
      setLoading(true);
      const [resInv, resRev] = await Promise.all([
        fetch("/api/collaboration/invitations"),
        fetch("/api/collaboration/reviews"),
      ]);

      const dataInv = await resInv.json();
      const dataRev = await resRev.json();

      setInvitations(dataInv.invitations || []);
      setReviews(dataRev.reviews || []);
      if (dataRev.reviews?.length > 0 && !selectedReviewId) {
        setSelectedReviewId(dataRev.reviews[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;

    const perms: string[] = [];
    if (permTransactions) perms.push("View transactions");
    if (permInvestments) perms.push("View investments");

    try {
      const res = await fetch("/api/collaboration/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          permissions: perms,
        }),
      });

      if (res.ok) {
        setInviteEmail("");
        fetchCollaborationData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRevokeInvite(id: string) {
    try {
      const res = await fetch(`/api/collaboration/invitations?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchCollaborationData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewCollaboratorId || !reviewTitle) return;

    try {
      const res = await fetch("/api/collaboration/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collaboratorId: reviewCollaboratorId,
          title: reviewTitle,
          description: reviewDescription,
          module: reviewModule,
        }),
      });

      if (res.ok) {
        setReviewTitle("");
        setReviewDescription("");
        fetchCollaborationData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentContent || !selectedReviewId) return;

    try {
      const res = await fetch(`/api/collaboration/reviews/${selectedReviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent }),
      });

      if (res.ok) {
        setCommentContent("");
        fetchCollaborationData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 animate-pulse text-lg">Connecting secure collaboration workspaces...</p>
      </div>
    );
  }

  const activeReview = reviews.find((r) => r.id === selectedReviewId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar - Invitations and Invite Form */}
      <div className="space-y-8">
        {/* Invite Advisor Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Invite Trusted Advisor</h4>
          <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="advisor@finance.io"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Advisor Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="Financial Planner">Financial Planner</option>
                <option value="Accountant">Accountant</option>
                <option value="Lawyer">Lawyer</option>
                <option value="Family Member">Family Member</option>
                <option value="Business Partner">Business Partner</option>
                <option value="Mentor">Mentor</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase block">Granular Permissions</label>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={permTransactions}
                    onChange={(e) => setPermTransactions(e.target.checked)}
                  />
                  <span>View Transactions Ledger</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={permInvestments}
                    onChange={(e) => setPermInvestments(e.target.checked)}
                  />
                  <span>View Investment Summaries</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Generate Share Token
            </button>
          </form>
        </div>

        {/* Invitations Ledger */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Pending Share Invitations</h4>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg text-xs">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{inv.email}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{inv.role} | {inv.status}</p>
                </div>
                {inv.status === "Pending" && (
                  <button
                    onClick={() => handleRevokeInvite(inv.id)}
                    className="text-rose-500 hover:text-rose-700 font-bold"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
            {invitations.length === 0 && (
              <p className="text-xs text-slate-500">No active invitations found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Review workspace - listing review request discussion threads */}
      <div className="lg:col-span-2 space-y-8">
        {/* Create Review Request Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4">Request Professional Review</h4>
          <form onSubmit={handleCreateReview} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Collaborator ID</label>
              <input
                type="text"
                value={reviewCollaboratorId}
                onChange={(e) => setReviewCollaboratorId(e.target.value)}
                placeholder="User ID of advisor"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Title</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Retirement Assumption Check"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Module Target</label>
              <select
                value={reviewModule}
                onChange={(e) => setReviewModule(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="Retirement">Retirement</option>
                <option value="Investments">Investments</option>
                <option value="Tax">Tax</option>
                <option value="Insurance">Insurance</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1 md:col-span-2">
              <label className="text-slate-500 font-semibold uppercase">Review details</label>
              <textarea
                value={reviewDescription}
                onChange={(e) => setReviewDescription(e.target.value)}
                placeholder="Describe what parts you would like the professional to audit..."
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100 h-10 resize-none"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors shadow-sm"
              >
                Publish Review Query
              </button>
            </div>
          </form>
        </div>

        {/* Selected Review request details comments thread */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List of review items */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-2 h-96 overflow-y-auto">
            <h5 className="font-bold text-xs text-slate-500 uppercase pb-2 border-b border-slate-100 dark:border-slate-700">Review Queries</h5>
            {reviews.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedReviewId(r.id)}
                className={`p-3 rounded-lg border cursor-pointer text-xs space-y-1 transition-colors ${
                  selectedReviewId === r.id
                    ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/15"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50/50"
                }`}
              >
                <p className="font-bold text-slate-900 dark:text-slate-100">{r.title}</p>
                <p className="text-[10px] text-slate-400">Target: {r.module}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-8">No requests created yet.</p>
            )}
          </div>

          {/* Active Comments thread */}
          <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col justify-between h-96">
            {activeReview ? (
              <>
                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                  <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{activeReview.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{activeReview.description}</p>
                  </div>

                  <div className="space-y-2">
                    {activeReview.comments?.map((c: any) => (
                      <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                          <span>User {c.authorId}</span>
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{c.content}</p>
                      </div>
                    ))}
                    {activeReview.comments?.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6">No discussion notes logged yet.</p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
                  <input
                    type="text"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a query comment..."
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-xs"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    Reply
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-slate-500">Select a review query on the left to show notes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
