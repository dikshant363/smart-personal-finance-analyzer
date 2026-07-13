# 13, 32, 33. AI Standards & Governance

This document outlines the guidelines, governance rules, and prompt engineering protocols for integrations involving Artificial Intelligence (AI).

## Core AI Principles
- **No Financial Advice**: AI outputs must never be phrased as regulated financial advice or guarantee monetary gains. Include clear, visible disclaimers on all AI-generated insight panels.
- **Explainability**: Recommendations must map back to traceable user parameters (e.g., pointing to high transaction lines, missing budgets, or dynamic scenario logs).
- **Explain Factuality**: Differentiate clearly between historical facts, mathematical projections, and probabilistic forecasts.
- **Provider Abstraction**: All LLM queries must route through an adapter layer to allow swapping providers (Google Gemini, OpenAI, Anthropic) without altering domain algorithms.

## Prompt Engineering Standards
1. **System Prompt Grounding**: System instructions must specify the precise persona, constraints, and data structure to return. Ground output strictly inside a JSON block with exact properties.
2. **Context Compression**: Minimize cost and maximize context efficiency by pruning redundant records. Convert decimal properties to simple floats and format dates as compact strings.
3. **Safety Guardrails**: Validate user input queries before appending them to LLM prompts. Block inputs containing known prompt injection keywords (e.g. "ignore previous instructions", "system prompts", "jailbreak").
4. **Token Cost Modeling**: Log token usage counts and calculate query cost metrics before returning outputs.

## Prompt Security & Injection Safeguards

### Correct Sanitization & Invocation
```typescript
const PROMPT_INJECTION_REGEX = /(ignore previous|system prompt|jailbreak|decode base64)/i;

export function isSafeInput(input: string): boolean {
  return !PROMPT_INJECTION_REGEX.test(input);
}

export async function generateFinancialInsight(
  context: string,
  userInput: string,
  model = "gemini-1.5-flash"
) {
  if (!isSafeInput(userInput)) {
    throw new Error("Potential prompt injection attempt detected.");
  }

  // Execute LLM execution adapter here...
}
```

### Incorrect Invocation (Jailbreak Vulnerable)
```typescript
// Anti-pattern: String interpolation of raw user input without injection screening
export async function getInsight(rawInput) {
  const prompt = `Analyze this user query: ${rawInput}`;
  return callLLM(prompt);
}
```

## AI Governance & Models Checklist
- [ ] Prompts are version-controlled in the repository files, not in database values.
- [ ] User input parameters are fully sanitized before compiling templates.
- [ ] Prompt injection checks are implemented at the application adapter layer.
- [ ] API responses are checked for correct JSON structure before parsing.
- [ ] Models specify fallback targets to handle service provider timeouts or outages.
- [ ] Calculations (interest rates, amortization, aggregates) are computed via TypeScript code, never by the AI.
