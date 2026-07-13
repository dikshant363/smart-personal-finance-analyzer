import type { UserDTO } from "@finance/shared-types";

/**
 * Shared Auth SDK — @finance/auth-sdk
 * Sprint 11.5: Core session manager and credential memory store.
 */

export interface SessionState {
  user: UserDTO | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
}

export type SessionListener = (state: SessionState) => void;

export class AuthSessionManager {
  private state: SessionState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoggedIn: false,
  };

  private listeners = new Set<SessionListener>();

  constructor() {
    this.loadPersistedSession();
  }

  private loadPersistedSession() {
    if (typeof window === "undefined") return;
    try {
      const persisted = localStorage.getItem("finance_session");
      if (persisted) {
        this.state = JSON.parse(persisted);
      }
    } catch {
      // Storage unavailable / corrupted
    }
  }

  private persistSession() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("finance_session", JSON.stringify(this.state));
    } catch {
      // Storage quota exceeded
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public setSession(user: UserDTO, accessToken: string, refreshToken: string) {
    this.state = {
      user,
      accessToken,
      refreshToken,
      isLoggedIn: true,
    };
    this.persistSession();
    this.notify();
  }

  public getSession(): SessionState {
    return this.state;
  }

  public clearSession() {
    this.state = {
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
    };
    if (typeof window !== "undefined") {
      localStorage.removeItem("finance_session");
    }
    this.notify();
  }
}
