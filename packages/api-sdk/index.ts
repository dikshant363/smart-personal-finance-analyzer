import type { ApiResponse } from "@finance/shared-types";

/**
 * Shared API Client SDK — @finance/api-sdk
 * Sprint 11.5: Platform-agnostic REST client wrapper with retry and auth hooks.
 */

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken: () => string | null;
  onTokenExpired?: () => Promise<string | null>; // Hook to execute refresh token flow
}

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: unknown,
    retries = 3
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}/${path.replace(/^\//, "")}`;
    const token = this.config.getAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Client-SDK": "TS-v11.5.0",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 401 && this.config.onTokenExpired) {
        // Attempt token refresh
        const newToken = await this.config.onTokenExpired();
        if (newToken && retries > 0) {
          return this.request(path, method, body, retries - 1);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          ok: false,
          error: {
            message: errorData.message || `HTTP error ${response.status}`,
            code: errorData.code || "API_ERROR",
          },
        };
      }

      const data = await response.json();
      return { ok: true, data };
    } catch (err) {
      if (retries > 0) {
        // Linear backoff retry
        await new Promise((resolve) => setTimeout(resolve, (4 - retries) * 1000));
        return this.request(path, method, body, retries - 1);
      }
      return {
        ok: false,
        error: {
          message: err instanceof Error ? err.message : "Network failure",
          code: "NETWORK_ERROR",
        },
      };
    }
  }

  public get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, "GET");
  }

  public post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, "POST", body);
  }

  public put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, "PUT", body);
  }

  public delete(path: string): Promise<ApiResponse<void>> {
    return this.request<void>(path, "DELETE");
  }
}
