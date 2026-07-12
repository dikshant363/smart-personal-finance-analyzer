import { prisma } from "@/lib/prisma";
import { createApplicationBackup } from "./backup";

export interface ReliabilityReport {
  isRecoveryValid: boolean;
  version: string;
  checks: {
    exportCompleteness: boolean;
    credentialsExclusion: boolean;
    schemaMatching: boolean;
  };
}

export async function validateDisasterRecoveryIntegrity(
  userId: string,
  db = prisma
): Promise<ReliabilityReport> {
  const backup = await createApplicationBackup(userId, db);

  const parsed = backup;
  const hasMeta = !!parsed.version;
  const hasData = Array.isArray(parsed.transactions);

  // Zero-Trust security exclusion check: verify no passwords or JWT secrets leak in data backups
  const backupStr = JSON.stringify(backup);
  const hasSecrets = backupStr.includes("password") || backupStr.includes("hash") || backupStr.includes("secret");

  return {
    isRecoveryValid: hasMeta && hasData && !hasSecrets,
    version: parsed.version || "unknown",
    checks: {
      exportCompleteness: !!hasData,
      credentialsExclusion: !hasSecrets,
      schemaMatching: !!hasMeta,
    },
  };
}
