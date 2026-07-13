export function triggerMockHapticFeedback(pattern: "success" | "warning" | "error"): boolean {
  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
    if (pattern === "success") {
      window.navigator.vibrate(50);
    } else if (pattern === "warning") {
      window.navigator.vibrate([100, 50, 100]);
    } else {
      window.navigator.vibrate([200, 100, 200]);
    }
    return true;
  }
  return false;
}

export function isMobileUserAgent(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

export function shareLinkToPlatform(title: string, text: string, url: string): Promise<boolean> {
  if (typeof window !== "undefined" && window.navigator && window.navigator.share) {
    return window.navigator
      .share({ title, text, url })
      .then(() => true)
      .catch(() => false);
  }
  return Promise.resolve(false);
}
