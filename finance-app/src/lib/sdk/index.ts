import { prisma } from "@/lib/prisma";

export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description?: string;
  permissions: string[]; // e.g. ["read:transactions", "write:transactions"]
  webhookUrl?: string;
}

export type ExtensionLifecycleState = "Installed" | "Enabled" | "Disabled" | "Uninstalled";

// 1. Webhook Notification Dispatcher
export async function triggerWebhookEvent(
  userId: string,
  event: "Transaction Created" | "Budget Updated" | "Goal Completed" | "Investment Added" | "Document Processed",
  payload: any,
  db = prisma
): Promise<void> {
  const activeExtensions = await db.developerExtension.findMany({
    where: {
      userId,
      status: "Enabled",
    },
  });

  for (const ext of activeExtensions) {
    if (!ext.webhookUrl) continue;
    
    // Check if the extension has permission for this resource
    const perms = ext.permissions.split(",");
    const matchesPermission =
      perms.includes("All") ||
      (event === "Transaction Created" && perms.includes("read:transactions")) ||
      (event === "Budget Updated" && perms.includes("read:budgets")) ||
      (event === "Goal Completed" && perms.includes("read:goals")) ||
      (event === "Investment Added" && perms.includes("read:investments")) ||
      (event === "Document Processed" && perms.includes("read:documents"));

    if (!matchesPermission) continue;

    // Async execution in background
    console.log(`[SDK Webhook] Dispatching event "${event}" to "${ext.webhookUrl}" for extension "${ext.name}"`);
    
    // In a real environment, we would execute fetch(ext.webhookUrl, { method: 'POST', body: JSON.stringify({ event, payload }) })
    // with retries, request signing, etc. We log it mock style for predictability and environment isolation.
  }
}

// 2. Extension Registry Service (CRUD)
export async function installExtension(userId: string, manifest: ExtensionManifest, db = prisma) {
  return db.developerExtension.create({
    data: {
      id: manifest.id,
      userId,
      name: manifest.name,
      version: manifest.version,
      author: manifest.author,
      description: manifest.description || null,
      permissions: manifest.permissions.join(","),
      webhookUrl: manifest.webhookUrl || null,
      status: "Disabled",
    },
  });
}

export async function toggleExtensionStatus(
  userId: string,
  extensionId: string,
  status: "Enabled" | "Disabled",
  db = prisma
) {
  return db.developerExtension.update({
    where: { id: extensionId },
    data: { status },
  });
}

export async function uninstallExtension(userId: string, extensionId: string, db = prisma) {
  await db.developerExtension.delete({
    where: { id: extensionId },
  });
  return true;
}

export async function getInstalledExtensions(userId: string, db = prisma) {
  return db.developerExtension.findMany({
    where: { userId },
  });
}
