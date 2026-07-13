import crypto from "crypto";

/**
 * Webhooks Dispatch Engine
 * Sprint 11.7 — Platform Extensibility & Developer Ecosystem
 *
 * Handles client endpoint registrations, cryptographically signs payloads with SHA256,
 * and executes HTTP deliveries with exponential retry policies.
 */

export interface WebhookSubscription {
  id: string;
  userId: string;
  url: string;
  secret: string; // Used to compute HMAC signature
  events: string[]; // e.g. ["transaction.created", "budget.exceeded"]
  isActive: boolean;
}

export interface WebhookPayload {
  eventId: string;
  event: string; // e.g. "transaction.created"
  timestamp: number;
  data: unknown;
}

export class WebhookEngine {
  private subscriptions: WebhookSubscription[] = [];

  constructor(initialSubscriptions: WebhookSubscription[] = []) {
    this.subscriptions = initialSubscriptions;
  }

  /**
   * Registers a developer subscription.
   */
  public register(sub: WebhookSubscription) {
    this.subscriptions.push(sub);
  }

  /**
   * Computes the HMAC signature for payload verification.
   */
  public computeSignature(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  /**
   * Dispatches event payload to matching subscribers.
   */
  public async dispatchEvent(
    event: string,
    userId: string,
    data: unknown
  ): Promise<{ dispatched: number; failed: number }> {
    const matched = this.subscriptions.filter(
      (sub) => sub.userId === userId && sub.isActive && sub.events.includes(event)
    );

    let dispatched = 0;
    let failed = 0;

    for (const sub of matched) {
      const payload: WebhookPayload = {
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        event,
        timestamp: Date.now(),
        data,
      };

      const serialized = JSON.stringify(payload);
      const signature = this.computeSignature(serialized, sub.secret);

      const success = await this.deliverWithRetry(sub.url, serialized, signature);
      if (success) {
        dispatched++;
      } else {
        failed++;
      }
    }

    return { dispatched, failed };
  }

  private async deliverWithRetry(
    url: string,
    body: string,
    signature: string,
    attempts = 3
  ): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Finance-Signature": signature,
          "User-Agent": "SmartFinance-Webhook-Dispatcher/1.0",
        },
        body,
      });

      if (response.ok) return true;

      if (attempts > 1) {
        // Exponential retry delay: 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, (4 - attempts) * 2000));
        return this.deliverWithRetry(url, body, signature, attempts - 1);
      }
      return false;
    } catch {
      if (attempts > 1) {
        await new Promise((resolve) => setTimeout(resolve, (4 - attempts) * 2000));
        return this.deliverWithRetry(url, body, signature, attempts - 1);
      }
      return false;
    }
  }
}
