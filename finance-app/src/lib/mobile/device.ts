/**
 * Device & Capability Abstraction Layers
 * Protects domain logic from direct platform API bindings.
 */

export interface SecureStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** In-memory fallback secure store with encryption mocks */
class FallbackSecureStore implements SecureStorage {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    const raw = this.store.get(key);
    if (!raw) return null;
    try {
      // Decode mock base64 encryption
      return typeof window !== "undefined" ? atob(raw) : Buffer.from(raw, "base64").toString("utf-8");
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const encoded = typeof window !== "undefined" ? btoa(value) : Buffer.from(value).toString("base64");
    this.store.set(key, encoded);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }
}

/** Standard Web LocalStorage implementation */
class WebSecureStore implements SecureStorage {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem(key);
    if (!value) return null;
    try {
      return atob(value);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === "undefined") return;
    const encoded = btoa(value);
    window.localStorage.setItem(key, encoded);
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  }
}

export const secureStorage: SecureStorage =
  typeof window !== "undefined" && window.localStorage
    ? new WebSecureStore()
    : new FallbackSecureStore();

/**
 * Biometrics Capability Detector
 */
export async function isBiometricsAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.navigator) return false;
  
  // Checks credentials API for WebAuthn authentication support
  if (window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Clipboard Operations
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window !== "undefined" && window.navigator && window.navigator.clipboard) {
    try {
      await window.navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Share sheet abstraction
 */
export async function presentShareSheet(title: string, text: string, url: string): Promise<boolean> {
  if (typeof window !== "undefined" && window.navigator && window.navigator.share) {
    try {
      await window.navigator.share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
