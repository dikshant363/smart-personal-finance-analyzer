import { prisma } from "@/lib/prisma";

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  metadata?: any;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface FinancialGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function compileUserFinancialGraph(userId: string, db = prisma): Promise<FinancialGraph> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Add User Node
  nodes.push({ id: `user_${userId}`, type: "User", label: "Primary User Profile" });

  // 1. Fetch Workspaces
  const workspaces = await db.workspace.findMany({
    where: { members: { some: { userId } } },
    include: {
      accounts: true,
      budgets: true,
      goals: true,
      transactions: true,
      liabilities: true,
      assets: true,
    },
  });

  for (const w of workspaces) {
    const wId = `workspace_${w.id}`;
    nodes.push({ id: wId, type: "Workspace", label: w.name, metadata: { type: w.type } });
    edges.push({ source: `user_${userId}`, target: wId, type: "Owns" });

    // Link Accounts
    for (const acc of w.accounts) {
      const accId = `account_${acc.id}`;
      nodes.push({ id: accId, type: "Account", label: acc.name, metadata: { balance: acc.currentBalance } });
      edges.push({ source: wId, target: accId, type: "Owns" });
      edges.push({ source: `user_${userId}`, target: accId, type: "Owns" });
    }

    // Link Budgets
    for (const b of w.budgets) {
      const bId = `budget_${b.id}`;
      nodes.push({ id: bId, type: "Budget", label: `Budget: ${b.name}`, metadata: { limit: b.amount } });
      edges.push({ source: wId, target: bId, type: "Owns" });
      edges.push({ source: `user_${userId}`, target: bId, type: "Owns" });
    }

    // Link Goals
    for (const g of w.goals) {
      const gId = `goal_${g.id}`;
      nodes.push({ id: gId, type: "Goal", label: g.name, metadata: { target: g.targetAmount } });
      edges.push({ source: wId, target: gId, type: "Owns" });
      edges.push({ source: `user_${userId}`, target: gId, type: "Owns" });

      if (g.portfolioId) {
        edges.push({ source: `portfolio_${g.portfolioId}`, target: gId, type: "Funds" });
      }
    }
  }

  // 2. Fetch Investments
  const investments = await db.investment.findMany({
    where: { userId },
  });
  for (const inv of investments) {
    const invId = `investment_${inv.id}`;
    nodes.push({ id: invId, type: "Investment", label: inv.name, metadata: { value: inv.currentValue } });
    edges.push({ source: `user_${userId}`, target: invId, type: "Owns" });
    if (inv.accountId) {
      edges.push({ source: `account_${inv.accountId}`, target: invId, type: "Linked To" });
    }
  }

  // 3. Fetch Insurance Policies
  const policies = await db.insurancePolicy.findMany({
    where: { userId },
  });
  for (const p of policies) {
    const pId = `policy_${p.id}`;
    nodes.push({ id: pId, type: "Insurance", label: p.name, metadata: { coverage: p.coverageAmount } });
    edges.push({ source: `user_${userId}`, target: pId, type: "Owns" });
  }

  // 4. Fetch Tax Records
  const taxRecords = await db.taxRecord.findMany({
    where: { userId },
  });
  for (const tr of taxRecords) {
    const trId = `tax_${tr.id}`;
    nodes.push({ id: trId, type: "TaxRecord", label: `${tr.category} (${tr.taxYear})`, metadata: { amount: tr.amount } });
    edges.push({ source: `user_${userId}`, target: trId, type: "Owns" });

    if (tr.documentId) {
      edges.push({ source: `document_${tr.documentId}`, target: trId, type: "Supports" });
    }
  }

  return { nodes, edges };
}

// Helper to find all nodes connected to a target node ID
export function getRelatedNodes(graph: FinancialGraph, targetNodeId: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const connectedNodeIds = new Set<string>();
  const filteredEdges: GraphEdge[] = [];

  for (const edge of graph.edges) {
    if (edge.source === targetNodeId) {
      connectedNodeIds.add(edge.target);
      filteredEdges.push(edge);
    } else if (edge.target === targetNodeId) {
      connectedNodeIds.add(edge.source);
      filteredEdges.push(edge);
    }
  }

  const filteredNodes = graph.nodes.filter((n) => n.id === targetNodeId || connectedNodeIds.has(n.id));
  return { nodes: filteredNodes, edges: filteredEdges };
}
