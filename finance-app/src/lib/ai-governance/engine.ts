export interface PromptSafetyCheck {
  isSafe: boolean;
  reason?: string;
}

export function validatePromptSafety(promptText: string): PromptSafetyCheck {
  const lower = promptText.toLowerCase();

  // Basic check for typical prompt injection keywords
  if (lower.includes("ignore previous instructions") || lower.includes("bypass system rules")) {
    return { isSafe: false, reason: "Potential Prompt Injection Attempt detected" };
  }

  // Basic check for sensitive data leakages (e.g. SSN or card number matches)
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/;
  const creditCardRegex = /\b(?:\d[ -]*?){13,16}\b/;

  if (ssnRegex.test(promptText)) {
    return { isSafe: false, reason: "SSN format found in prompt" };
  }
  if (creditCardRegex.test(promptText)) {
    return { isSafe: false, reason: "Credit Card format found in prompt" };
  }

  return { isSafe: true };
}

export function trackTokenCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    "gemini-1.5-pro": { input: 0.000007, output: 0.000021 },
    "gemini-1.5-flash": { input: 0.00000035, output: 0.00000105 },
    default: { input: 0.000005, output: 0.000015 },
  };

  const selected = rates[model] || rates.default;
  return inputTokens * selected.input + outputTokens * selected.output;
}
