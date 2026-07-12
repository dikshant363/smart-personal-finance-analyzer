"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Users,
  Plus,
  Mail,
  CheckCircle,
  XCircle,
  Activity,
  Briefcase,
  AlertTriangle,
} from "lucide-react";

type WorkspaceSummary = {
  workspaceId: string;
  name: string;
  type: string;
  role: string;
  membersCount: number;
};

type WorkspaceMember = {
  id: string;
  workspaceId: string;
  role: string;
  user: {
    name: string | null;
    email: string;
  };
};

type WorkspaceInvitation = {
  id: string;
  workspaceId: string;
  email: string;
  role: string;
  status: string;
  workspace: { name: string };
  invitedBy: { name: string | null; email: string };
};

type ActivityLog = {
  id: string;
  action: string;
  details: string;
  createdAt: string | Date;
};

export function WorkspaceClient({
  initialSummary,
  initialMembers,
  initialInvitations,
  initialLogs,
  currentUserEmail,
}: {
  initialSummary: WorkspaceSummary[];
  initialMembers: WorkspaceMember[];
  initialInvitations: WorkspaceInvitation[];
  initialLogs: ActivityLog[];
  currentUserEmail: string;
}) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceSummary[]>(initialSummary);
  const [activeWorkspaceId, setActiveWorkspaceId] = React.useState(workspaces[0]?.workspaceId || "");
  
  const [members, setMembers] = React.useState<WorkspaceMember[]>(initialMembers);
  const [invitations, setInvitations] = React.useState<WorkspaceInvitation[]>(initialInvitations);
  const [logs, setLogs] = React.useState<ActivityLog[]>(initialLogs);

  const [isAddingWorkspace, setIsAddingWorkspace] = React.useState(false);
  const [isAddingMember, setIsAddingMember] = React.useState(false);

  // Forms
  const [wsName, setWsName] = React.useState("");
  const [wsType, setWsType] = React.useState("Family");

  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("Editor");
  const [inviteError, setInviteError] = React.useState<string | null>(null);

  // Track workspace details on selection switch
  async function handleSelectWorkspace(id: string) {
    setActiveWorkspaceId(id);
    const [mRes, lRes] = await Promise.all([
      fetch(`/api/workspaces/members?workspaceId=${id}`),
      fetch(`/api/workspaces/activity?workspaceId=${id}`),
    ]);

    if (mRes.ok) {
      const mData = await mRes.json();
      setMembers(mData.members ?? []);
    }
    if (lRes.ok) {
      const lData = await lRes.json();
      setLogs(lData.activity ?? []);
    }
  }

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: wsName, type: wsType }),
    });

    if (res.ok) {
      setIsAddingWorkspace(false);
      setWsName("");
      refreshAll();
    }
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);

    const res = await fetch("/api/workspaces/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: activeWorkspaceId, email: inviteEmail, role: inviteRole }),
    });

    if (res.ok) {
      setIsAddingMember(false);
      setInviteEmail("");
      refreshAll();
    } else {
      const data = await res.json();
      setInviteError(data.message || "Failed to trigger email invitation.");
    }
  }

  async function handleResponseInvite(invitationId: string, response: "Accept" | "Decline") {
    const res = await fetch("/api/workspaces/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId, response }),
    });

    if (res.ok) {
      refreshAll();
    }
  }

  async function refreshAll() {
    const [wsRes, invsRes] = await Promise.all([
      fetch("/api/workspaces"),
      fetch("/api/workspaces/invitations"),
    ]);

    const wsData = await wsRes.json();
    const invsData = await invsRes.json();

    const list: WorkspaceSummary[] = wsData.workspaces ?? [];
    setWorkspaces(list);
    setInvitations(invsData.invitations ?? []);

    const currentActive = list.find((w) => w.workspaceId === activeWorkspaceId)
      ? activeWorkspaceId
      : list[0]?.workspaceId || "";
    
    if (currentActive) {
      handleSelectWorkspace(currentActive);
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Pending invites bar */}
      {invitations.length > 0 && (
        <div className="space-y-2 text-xs">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider text-[9px]">
            Pending Collaborator Invitations ({invitations.length})
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="p-3 border border-indigo-100 dark:border-neutral-800 rounded-xl bg-indigo-50/50 dark:bg-neutral-900/50 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Invite to &apos;{inv.workspace.name}&apos;
                  </p>
                  <p className="text-[9px] text-neutral-400">
                    From: {inv.invitedBy.name || inv.invitedBy.email} ({inv.role})
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => handleResponseInvite(inv.id, "Accept")}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 h-7 text-[10px]"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResponseInvite(inv.id, "Decline")}
                    className="h-7 text-[10px]"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main split view */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left sidebar: workspaces list */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs font-semibold">Your Workspaces</CardTitle>
              <button
                onClick={() => setIsAddingWorkspace(true)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-indigo-600"
                title="Create Workspace"
              >
                <Plus className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-1.5 max-h-[350px] overflow-y-auto p-2">
              {workspaces.map((ws) => {
                const isActive = ws.workspaceId === activeWorkspaceId;
                return (
                  <button
                    key={ws.workspaceId}
                    onClick={() => handleSelectWorkspace(ws.workspaceId)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl border text-xs flex justify-between items-center transition-colors",
                      isActive
                        ? "border-indigo-500 bg-indigo-50/20 text-indigo-900 dark:text-indigo-100"
                        : "border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    )}
                  >
                    <div className="space-y-0.5 shrink-0">
                      <span className="font-semibold block">{ws.name}</span>
                      <span className="text-[9px] text-neutral-400 block uppercase tracking-wider">
                        {ws.type} | Role: {ws.role}
                      </span>
                    </div>
                    <Badge variant="info" className="text-[9px] px-1.5 py-0 font-medium">
                      {ws.membersCount} members
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Center/Right: members list and activity feed */}
        <div className="lg:col-span-3 grid gap-6 md:grid-cols-3">
          {/* Members list */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-500" /> Collaborator Roster
              </CardTitle>
              {activeWorkspaceId && (
                <Button
                  size="sm"
                  onClick={() => setIsAddingMember(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 text-[10px]"
                >
                  <Plus className="h-3.5 w-3.5" /> Invite Member
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2.5">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 flex justify-between items-center text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {m.user.name || "Pending Collaborator"}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">{m.user.email}</span>
                  </div>
                  <Badge variant="default" className="text-[9px] px-2 uppercase tracking-wide">
                    {m.role}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-indigo-500" /> Space Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[350px] overflow-y-auto space-y-3 text-[10px]">
              {logs.map((log) => (
                <div key={log.id} className="space-y-1">
                  <div className="flex justify-between text-neutral-400">
                    <span className="font-bold text-neutral-500">{log.action}</span>
                    <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-normal">{log.details}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Workspace Dialog */}
      {isAddingWorkspace && (
        <Dialog open={isAddingWorkspace} onClose={() => setIsAddingWorkspace(false)} title="Register Collaborative Workspace">
          <form onSubmit={handleCreateWorkspace} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Workspace Hub Name</label>
              <Input value={wsName} onChange={(e) => setWsName(e.target.value)} required placeholder="e.g. Shared Family Trust" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Collaborative Type</label>
              <Select value={wsType} onChange={(e) => setWsType(e.target.value)}>
                <option value="Couple">Couple Shared</option>
                <option value="Family">Family Household</option>
                <option value="Roommates">Roommates Space</option>
                <option value="Business">Business Venture</option>
                <option value="Custom">Custom Group</option>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddingWorkspace(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Create Space</Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Invite Member Dialog */}
      {isAddingMember && (
        <Dialog open={isAddingMember} onClose={() => setIsAddingMember(false)} title="Send Collaboration Invitation">
          <form onSubmit={handleInviteMember} className="space-y-3.5 text-xs">
            {inviteError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 font-semibold text-[10px]">
                {inviteError}
              </div>
            )}
            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Invited Collaborator Email</label>
              <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required placeholder="collaborator@domain.com" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Assign Role</label>
              <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="Administrator">Administrator (Manage settings & invites)</option>
                <option value="Editor">Editor (Create & update transactions)</option>
                <option value="Contributor">Contributor (Submit bills & expenses)</option>
                <option value="Viewer">Viewer (Read-only analytics access)</option>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddingMember(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Send Invitation</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
