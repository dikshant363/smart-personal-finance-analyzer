# Smart Personal Finance Analyzer

## Prerequisites
- Node.js 18+
- Docker and Docker Compose

## Setup
1. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run initial migration:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables
See `.env.example` for required variables. Copy to `.env` and fill in values.

## Financial Health Score
The score is computed live from the user's data (0–100, 8 weighted dimensions) and persisted monthly to `ScoreHistory`. It is available at the dashboard card and `/score`.

After adding the `ScoreHistory` schema, run:
```bash
npx prisma migrate dev --name add_score_history
npx prisma generate
```

Run tests with:
```bash
npm test
```

## Spending Intelligence

The Spending Intelligence engine performs rule-based spending analysis from the user's transactions and budgets:

- **Insights**: plain-language findings (top categories, month-over-month and year-over-year changes, recurring commitments, weekend spending).
- **Alerts**: proactive warnings (over-budget, large purchases, spending spikes, unusual category growth).
- **Trends**: daily/weekly/monthly/quarterly/yearly spending series plus income-vs-expense, savings, cashflow, and top-category breakdowns.

It is available in the dashboard "Spending Intelligence" section and at `/spending`. The JSON API is served at `/api/analysis/spending`. Results are computed via `analyzeSpending` and cached for 5 minutes per user.

## Financial Recommendation Engine

A deterministic rule engine generates typed recommendations (savings, budget, expense, cashflow, emergency fund, recurring, risk, positive reinforcement, etc.) for the user. An optional AI layer rewrites explanations; it falls back to the rule-generated text when `OPENAI_API_KEY` is not set. All recommendations are persisted in the `Recommendation` table.

Features:
- Dashboard "Financial Recommendations" card.
- `/recommendations` page with filter, sort, accept, dismiss, and complete actions.
- API routes:
  - `GET /api/recommendations` — list recommendations.
  - `POST /api/recommendations` — generate new recommendations.
  - `PATCH /api/recommendations/[id]` — update recommendation status.
  - `GET /api/recommendations/analytics` — recommendation analytics for the user.

## Financial Goals

Users can create, track, and manage financial goals with target amounts, deadlines, and progress tracking.

- Dashboard "Goals" widget shows progress toward active goals.
- Dedicated `/goals` page with CRUD operations and status filtering.
- API routes:
  - `GET /api/goals` — list goals.
  - `POST /api/goals` — create a new goal.
  - `PATCH /api/goals/[id]` — update goal details.
  - `DELETE /api/goals/[id]` — delete a goal.

## AI Insight & Explanation Engine

The AI Insight & Explanation Engine converts deterministic financial analysis into clear, personalized, trustworthy explanations. The AI never performs financial calculations; it only explains, summarizes, and educates based on engine outputs.

- Dashboard "AI Insights" feed.
- `/ai-insights` page with refresh and feedback controls.
- API routes:
  - `GET /api/ai-insights` — list insights, optional `type` and `refresh` query params.
  - `POST /api/ai-insights` — regenerate insights, optional `types[]` body.
  - `POST /api/ai-insights/[id]/feedback` — submit helpful/not_helpful feedback.
  - `DELETE /api/ai-insights/[id]/feedback` — dismiss an insight.

Insights are versioned (`promptVersion`, `contextVersion`) and respect the `aiInsightsEnabled` user setting.
