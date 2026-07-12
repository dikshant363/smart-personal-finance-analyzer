import { prisma } from "@/lib/prisma";

export interface NotificationPayload {
  title: string;
  body: string;
  type: "info" | "warning" | "critical" | "success" | "reminder" | "recommendation" | "achievement";
}

// Simple in-memory de-duplication cache
const recentAlertsCache = new Map<string, number>();

export async function sendNotification(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  const cacheKey = `${userId}_${payload.title}_${payload.type}`;
  const now = Date.now();

  // Deduplication check: ignore if an identical alert was sent in the last 60 seconds
  if (recentAlertsCache.has(cacheKey)) {
    const lastSent = recentAlertsCache.get(cacheKey) || 0;
    if (now - lastSent < 60000) {
      return false; // Skip duplicate to prevent notification spam
    }
  }
  recentAlertsCache.set(cacheKey, now);

  // 1. Create In-App Notification entry
  await prisma.notification.create({
    data: {
      userId,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      isRead: false,
    },
  });

  // 2. Email Infrastructure mock
  sendMockEmail(userId, payload);

  return true;
}

export function sendMockEmail(userId: string, payload: NotificationPayload) {
  console.log(`[EMAIL DISPATCH] To: user_${userId}@finance.io | Subject: ${payload.title} | Content: ${payload.body}`);
}

export async function getNotifications(userId: string, isRead?: boolean) {
  return prisma.notification.findMany({
    where: {
      userId,
      isRead: isRead !== undefined ? isRead : undefined,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(userId: string, id: string) {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return null;

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function deleteNotification(userId: string, id: string) {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return false;

  await prisma.notification.delete({ where: { id } });
  return true;
}
