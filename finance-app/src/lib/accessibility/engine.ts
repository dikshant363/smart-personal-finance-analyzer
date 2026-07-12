export interface AuditResult {
  errors: string[];
  passed: boolean;
}

export function auditAccessibilityAttributes(htmlContent: string): AuditResult {
  const errors: string[] = [];

  // 1. Image alt tag check: match any <img that does NOT contain "alt="
  const imgTags = htmlContent.match(/<img[^>]*>/gi) || [];
  for (const img of imgTags) {
    if (!/alt=/i.test(img)) {
      errors.push(`Image missing alternate description tag: ${img}`);
    }
  }

  // 2. Input element accessibility: match any <input that lacks "id" or "aria-label"
  const inputTags = htmlContent.match(/<input[^>]*>/gi) || [];
  for (const input of inputTags) {
    if (!/id=/i.test(input) && !/aria-label=/i.test(input)) {
      errors.push(`Input element lacks labeling id or aria-label: ${input}`);
    }
  }

  return {
    errors,
    passed: errors.length === 0,
  };
}
