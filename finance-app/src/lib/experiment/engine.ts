import { prisma } from "@/lib/prisma";

export function computeRolloutBucket(userId: string, key: string): number {
  let hash = 0;
  const str = `${userId}:${key}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % 100; // returns 0-99 range
}

export async function isFeatureEnabled(userId: string, key: string, db = prisma): Promise<boolean> {
  const flag = await db.featureFlag.findUnique({
    where: { key },
  });

  if (!flag) return false;
  if (!flag.enabled) return false;

  // Percentage-based rollout checks
  const bucket = computeRolloutBucket(userId, key);
  return bucket < flag.rolloutPercent;
}

export async function registerFeatureFlag(
  key: string,
  name: string,
  description?: string,
  rolloutPercent = 100,
  db = prisma
) {
  return db.featureFlag.upsert({
    where: { key },
    update: { name, description, rolloutPercent },
    create: { key, name, description, rolloutPercent, enabled: false },
  });
}

export async function updateFlagState(
  key: string,
  enabled: boolean,
  rolloutPercent?: number,
  db = prisma
) {
  return db.featureFlag.update({
    where: { key },
    data: {
      enabled,
      ...(rolloutPercent !== undefined ? { rolloutPercent } : {}),
    },
  });
}

export async function getFeatureFlags(db = prisma) {
  return db.featureFlag.findMany();
}
