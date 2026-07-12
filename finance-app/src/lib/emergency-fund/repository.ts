import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export type Db = typeof prisma;

export interface EmergencyFundSettingsData {
  targetMonths: number;
  customEssentialExpenses: number | null;
  customReserve: number | null;
}

export async function getEmergencyFundSettings(
  userId: string,
  db: Db = prisma
) {
  let settings = await db.emergencyFundSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    settings = await db.emergencyFundSettings.create({
      data: {
        userId,
        targetMonths: 6,
      },
    });
  }

  return {
    ...settings,
    customEssentialExpenses: settings.customEssentialExpenses ? toNumber(settings.customEssentialExpenses) : null,
    customReserve: settings.customReserve ? toNumber(settings.customReserve) : null,
  };
}

export async function updateEmergencyFundSettings(
  userId: string,
  data: Partial<EmergencyFundSettingsData>,
  db: Db = prisma
) {
  const settings = await db.emergencyFundSettings.upsert({
    where: { userId },
    update: {
      targetMonths: data.targetMonths,
      customEssentialExpenses: data.customEssentialExpenses,
      customReserve: data.customReserve,
    },
    create: {
      userId,
      targetMonths: data.targetMonths ?? 6,
      customEssentialExpenses: data.customEssentialExpenses,
      customReserve: data.customReserve,
    },
  });

  return {
    ...settings,
    customEssentialExpenses: settings.customEssentialExpenses ? toNumber(settings.customEssentialExpenses) : null,
    customReserve: settings.customReserve ? toNumber(settings.customReserve) : null,
  };
}

export async function getEmergencyFundHistory(
  userId: string,
  db: Db = prisma
) {
  const history = await db.emergencyFundHistory.findMany({
    where: { userId },
    orderBy: { month: "asc" },
  });

  return history.map((h) => ({
    ...h,
    coverageMonths: toNumber(h.coverageMonths),
    currentReserve: toNumber(h.currentReserve),
    essentialExpenses: toNumber(h.essentialExpenses),
  }));
}

export async function saveEmergencyFundHistory(
  userId: string,
  data: {
    month: string;
    coverageMonths: number;
    readinessScore: number;
    currentReserve: number;
    essentialExpenses: number;
  },
  db: Db = prisma
) {
  return db.emergencyFundHistory.upsert({
    where: {
      userId_month: {
        userId,
        month: data.month,
      },
    },
    update: {
      coverageMonths: data.coverageMonths,
      readinessScore: data.readinessScore,
      currentReserve: data.currentReserve,
      essentialExpenses: data.essentialExpenses,
    },
    create: {
      userId,
      month: data.month,
      coverageMonths: data.coverageMonths,
      readinessScore: data.readinessScore,
      currentReserve: data.currentReserve,
      essentialExpenses: data.essentialExpenses,
    },
  });
}
