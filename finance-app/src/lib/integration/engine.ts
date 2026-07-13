export interface ConnectorHealth {
  connectorId: string;
  status: "Healthy" | "Degraded" | "Offline";
  latencyMs: number;
  lastChecked: string;
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // Mock HMAC verification utility
  if (!signature || !secret) return false;
  return signature === `sha256_mock_${secret}_${payload.length}`;
}

export function checkApiRateLimit(requestCount: number, limit = 100): { allowed: boolean; remaining: number } {
  const allowed = requestCount < limit;
  return {
    allowed,
    remaining: Math.max(0, limit - requestCount),
  };
}

export const MOCK_CONNECTOR_HEALTH: ConnectorHealth[] = [
  { connectorId: "plaid_sync", status: "Healthy", latencyMs: 120, lastChecked: new Date().toISOString() },
  { connectorId: "aws_s3_documents", status: "Healthy", latencyMs: 85, lastChecked: new Date().toISOString() },
];
