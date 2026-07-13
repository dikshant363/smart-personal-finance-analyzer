# AI Governance Policy

## 1. Provider Abstraction Policy
- All LLM integrations must rely on the provider-independent Orchestration Layer SDK. Direct integration of vendor-specific APIs is forbidden.

## 2. Safety & Prompt Versioning
- Prompts must be versioned separately in version control.
- Input queries must route through injection protection layers.
- Responses must clearly separate facts, user assumptions, and educational disclaimers.

## 3. Grounded Outputs
- AI models must never calculate financial metrics on their own. They must retrieve structured summaries from deterministic services.
- Never guarantee investment yields or market outcomes.
