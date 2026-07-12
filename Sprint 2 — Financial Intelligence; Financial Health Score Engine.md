# Milestone 2.1

Prompt 016 — Sprint 2.1: Financial Health Score Engine  
You are an elite engineering team consisting of:

• Principal Software Engineer  
• Principal Product Engineer  
• Senior FinTech Engineer  
• AI Engineer  
• Backend Engineer  
• Frontend Engineer  
• QA Engineer  
• Security Engineer  
• UX Engineer

\====================================================

PROJECT

Smart Personal Finance Analyzer

\====================================================

IMPORTANT

The existing project is COMPLETE and WORKING.

DO NOT redesign anything.

DO NOT replace architecture.

DO NOT change folder structure.

DO NOT change authentication.

DO NOT change APIs unless absolutely required.

DO NOT modify existing UI unnecessarily.

Build on top of the existing project.

\====================================================

OBJECTIVE

Implement Sprint 2.1

Financial Health Score Engine

\====================================================

FEATURE OVERVIEW

Create an intelligent Financial Health Score that gives every user a score from:

0 → 100

The score must update automatically whenever financial data changes.

\====================================================

The score should be calculated from multiple dimensions.

Examples:

Savings Ratio

Income Stability

Budget Discipline

Expense Distribution

Emergency Fund Progress

Cash Flow

Recurring Expense Burden

Financial Consistency

\====================================================

Each dimension must have:

Name

Current Value

Ideal Value

Weight

Contribution

Improvement Suggestions

\====================================================

Example

Savings Ratio

Current:

18%

Ideal:

30%

Weight:

20%

Contribution:

12 points

Recommendation:

Increase monthly savings by ₹2,500.

\====================================================

Dashboard

Add a new premium card.

Display

Overall Score

Circular Progress

Status

Last Updated

Trend

\====================================================

Example

92

Excellent

↑ \+4 this month

\====================================================

Score Categories

90–100

Excellent

75–89

Very Good

60–74

Good

40–59

Needs Improvement

20–39

Poor

0–19

Critical

\====================================================

Generate AI-friendly explanations.

Examples

Your score increased because:

• Spending decreased

• Savings increased

• Budget adherence improved

\====================================================

Store score history.

Every month:

Save

Score

Breakdown

Timestamp

\====================================================

Generate trends.

Weekly

Monthly

Yearly

\====================================================

Generate recommendations.

Prioritize by impact.

Estimate potential score improvement.

\====================================================

Performance

Score calculation should be fast.

Avoid unnecessary recalculation.

\====================================================

Testing

Generate:

Unit tests

Integration tests

Edge cases

\====================================================

Acceptance Criteria

✓ Score updates automatically

✓ Dashboard displays score

✓ Breakdown is visible

✓ Recommendations generated

✓ History stored

✓ Existing features continue working

✓ npm run build succeeds

✓ npm run dev succeeds

\====================================================

OUTPUT

Implement complete production-ready code.

Include

Backend

Frontend

Database changes

Tests

Documentation

Migration

Do not modify unrelated modules.

# Milestone 2.2

Prompt 017 — Sprint 2.2: Spending Intelligence & Pattern Analysis Engine

You are an elite software engineering organization consisting of:

• Principal Software Engineer  
• Principal AI Engineer  
• Senior FinTech Engineer  
• Senior Product Engineer  
• Backend Engineer  
• Frontend Engineer  
• Data Engineer  
• UX Engineer  
• QA Engineer  
• Security Engineer

\====================================================

PROJECT

Smart Personal Finance Analyzer

\====================================================

IMPORTANT

The existing application is working.

Do NOT redesign architecture.

Do NOT replace existing code.

Do NOT change authentication.

Do NOT modify existing APIs unless necessary.

Do NOT introduce breaking database changes.

Build incrementally.

\====================================================

SPRINT

Sprint 2.2

Spending Intelligence & Pattern Analysis Engine

\====================================================

OBJECTIVE

Transform raw transaction data into actionable financial intelligence.

This is NOT a reporting feature.

This is an intelligent analysis engine.

\====================================================

CORE CAPABILITIES

The system must automatically analyze spending patterns.

Generate insights without requiring the user to ask.

\====================================================

Generate insights such as:

Top spending categories

Largest spending increases

Largest spending decreases

Unusual spending

Budget risk

Recurring spending

Weekend vs weekday spending

Monthly trend

Seasonal trend

Income vs spending trend

Savings trend

Cash flow trend

Category trend

\====================================================

For every insight include:

Title

Summary

Detailed explanation

Evidence

Confidence

Impact

Priority

Suggested action

\====================================================

Example

Title

Restaurant spending increased.

Explanation

Restaurant expenses increased by 42%  
compared to last month.

Evidence

₹7,400 → ₹10,500

Impact

Medium

Suggestion

Reducing restaurant spending by ₹2,000  
would improve your Financial Health Score.

\====================================================

Detect anomalies.

Examples

Very large purchase

Duplicate transaction

Rapid spending spike

Budget overspending

Unusual category growth

\====================================================

Trend Analysis

Daily

Weekly

Monthly

Quarterly

Yearly

\====================================================

Comparisons

Current month vs previous month

Current month vs same month last year

Category comparison

Income vs expenses

Budget vs actual

\====================================================

Dashboard

Create a new section:

Spending Intelligence

Display:

Top Insights

Alerts

Trends

Recommendations

\====================================================

Visualizations

Category distribution

Monthly spending

Income vs expenses

Trend lines

Budget utilization

Savings trend

\====================================================

Performance

Cache expensive calculations.

Avoid recalculating unchanged periods.

\====================================================

Architecture

Keep analysis logic separate from UI.

Create reusable analysis services.

Avoid embedding business logic in React components.

\====================================================

Testing

Generate:

Unit tests

Integration tests

Edge cases

Performance tests

\====================================================

Acceptance Criteria

✓ Automatic insight generation

✓ Trend analysis works

✓ Category comparison works

✓ Anomaly detection works

✓ Dashboard displays insights

✓ Existing functionality remains unchanged

✓ npm run build succeeds

✓ npm run dev succeeds

\====================================================

OUTPUT

Implement complete production-ready code.

Include:

Backend

Frontend

Database updates (only if required)

Tests

Documentation

Migration (only if required)

Do not modify unrelated modules.

# Milestone 2.3

Prompt 018 — Sprint 2.3: Financial Recommendation Engine (FRE)

You are an elite engineering team composed of:

• Principal AI Engineer  
• Principal Backend Engineer  
• Principal Frontend Engineer  
• Principal FinTech Engineer  
• Senior Product Engineer  
• Data Scientist  
• UX Engineer  
• QA Engineer  
• Security Engineer

\====================================================

PROJECT

Smart Personal Finance Analyzer

\====================================================

IMPORTANT

The current application is fully working.

Financial Health Score has already been implemented.

Spending Intelligence Engine has already been implemented.

Do NOT redesign architecture.

Do NOT replace existing services.

Do NOT modify authentication.

Do NOT introduce breaking database changes.

Extend the current architecture only.

\====================================================

SPRINT

Sprint 2.3

Financial Recommendation Engine (FRE)

\====================================================

OBJECTIVE

Build an intelligent recommendation engine that continuously analyzes the user's financial behaviour and generates personalized, explainable, and prioritized financial recommendations.

The system must be deterministic first, AI-enhanced second.

Business rules should generate recommendations where possible.

AI should improve explanations and prioritization, not replace core financial calculations.

\====================================================

RECOMMENDATION CATEGORIES

Savings

Budget Optimization

Expense Reduction

Cash Flow Improvement

Financial Health Improvement

Emergency Fund

Income Opportunities

Subscription Optimization

Recurring Expense Optimization

Category Optimization

Lifestyle Spending

Seasonal Spending

Risk Warnings

Positive Reinforcement

Future Planning

\====================================================

FOR EVERY RECOMMENDATION

Generate:

Unique ID

Title

Summary

Detailed Explanation

Reason

Evidence

Estimated Monthly Savings

Estimated Annual Savings

Financial Health Score Impact

Difficulty

Priority

Confidence

Recommended Action

Category

Expiration

Created Date

\====================================================

EXAMPLES

Restaurant spending increased 28%.

Estimated yearly savings:

₹18,000

Priority:

High

Difficulty:

Easy

Expected Health Score Improvement:

\+6

\----------------------------------------------------

Emergency fund covers only 0.8 months.

Recommended target:

6 months.

Priority:

Critical

\====================================================

RECOMMENDATION PRIORITY

Critical

High

Medium

Low

\====================================================

DIFFICULTY

Easy

Moderate

Hard

\====================================================

CONFIDENCE

Very High

High

Medium

Low

\====================================================

IMPLEMENT RULE-BASED RECOMMENDATIONS

Examples

Budget exceeded

Large recurring expense

Low savings ratio

Negative cash flow

Large entertainment spending

Rapid spending increase

Unused budget

Income increase

Improving savings

Financial score decline

\====================================================

AI ENHANCEMENT

The AI layer should:

Rewrite recommendations into natural language.

Explain WHY.

Provide educational context.

Suggest alternatives.

Generate motivational summaries.

Never invent financial data.

Never fabricate calculations.

Always reference actual user data.

\====================================================

DASHBOARD

Create a new section:

Financial Recommendations

Display:

Top Recommendation

High Priority

Potential Monthly Savings

Potential Yearly Savings

Expected Financial Score Improvement

\====================================================

DETAIL PAGE

Each recommendation must include:

Problem

Evidence

Why It Matters

Suggested Action

Potential Savings

Confidence

Related Transactions

Historical Trend

\====================================================

FILTERING

By:

Priority

Category

Difficulty

Impact

Savings Amount

\====================================================

SORTING

Priority

Savings

Health Score Impact

Newest

Oldest

\====================================================

ARCHIVE

Users can:

Accept recommendation

Dismiss recommendation

Archive recommendation

Mark completed

Track progress

\====================================================

HISTORY

Track:

Created

Accepted

Dismissed

Completed

Ignored

\====================================================

ANALYTICS

Measure:

Acceptance rate

Completion rate

Average savings generated

Most common recommendation type

Financial score improvement

\====================================================

PERFORMANCE

Recommendations should update only when financial data changes.

Avoid unnecessary recalculations.

\====================================================

ARCHITECTURE

Separate:

Recommendation Engine

Rule Engine

AI Explanation Layer

Recommendation Repository

Recommendation History

Recommendation Analytics

Do NOT mix business logic into React components.

\====================================================

TESTING

Generate:

Unit tests

Integration tests

Performance tests

Edge cases

\====================================================

ACCEPTANCE CRITERIA

✓ Recommendations generated automatically

✓ Prioritization works

✓ Dashboard integration complete

✓ AI explanations available

✓ History tracked

✓ Analytics collected

✓ Existing functionality unchanged

✓ npm run build succeeds

✓ npm run dev succeeds

\====================================================

OUTPUT

Implement complete production-ready code.

Include:

Backend

Frontend

Database updates (if required)

Migrations (if required)

Tests

Documentation

Do not modify unrelated modules.

Follow the existing architecture and coding standards.

# Milestone 2.4

Prompt 019 — Sprint 2.4: Financial Forecasting Engine (FFE)

You are an elite software engineering organization composed of:

• Principal AI Engineer  
• Principal Backend Engineer  
• Principal Frontend Engineer  
• Principal Data Scientist  
• Principal FinTech Engineer  
• Principal Software Architect  
• Senior Product Engineer  
• UX Engineer  
• QA Engineer  
• Performance Engineer

\====================================================

PROJECT

Smart Personal Finance Analyzer

\====================================================

IMPORTANT

The current application is fully working.

The following systems already exist:

✓ Financial Health Score Engine

✓ Spending Intelligence Engine

✓ Financial Recommendation Engine

Do NOT redesign architecture.

Do NOT replace existing modules.

Do NOT modify authentication.

Do NOT introduce breaking database changes.

Build on top of the current architecture.

\====================================================

SPRINT

Sprint 2.4

Financial Forecasting Engine (FFE)

\====================================================

OBJECTIVE

Build a reusable Financial Forecasting Engine capable of predicting future financial outcomes using historical financial data.

This is NOT an AI chatbot.

This is NOT a reporting feature.

This is an independent prediction engine.

\====================================================

DESIGN PRINCIPLES

Deterministic calculations first.

AI-generated explanations second.

Predictions must always be explainable.

Never fabricate financial data.

Always distinguish:

Historical facts

↓

Calculated prediction

↓

AI explanation

\====================================================

ENGINE RESPONSIBILITIES

Predict:

Cash Flow

Savings

Expenses

Income

Budget utilization

Category spending

Emergency fund growth

Financial Health Score

Goal completion

Net balance

\====================================================

FORECAST PERIODS

7 Days

30 Days

90 Days

6 Months

1 Year

Custom

\====================================================

GENERATE FORECASTS

Cash available

Income estimate

Expense estimate

Budget risk

Savings estimate

Financial Health estimate

Expected surplus

Expected deficit

\====================================================

SCENARIOS

Best Case

Expected Case

Worst Case

\====================================================

WHAT-IF SIMULATOR

Users can simulate:

Increase income

Reduce expenses

Change budget

Cancel subscription

Increase savings

Large purchase

Unexpected expense

Salary increase

\====================================================

Example

"What happens if I save ₹5,000 more every month?"

Generate:

Cash flow

Savings

Financial score

Goal completion estimate

\====================================================

RISK DETECTION

Detect:

Budget exhaustion

Cash deficit

Overspending

Savings decline

Emergency fund risk

High recurring expenses

\====================================================

AI EXPLANATION

Explain:

Why this prediction exists

Confidence

Assumptions

Limitations

Alternative scenarios

Suggested actions

\====================================================

DASHBOARD

Add:

Forecast Card

Forecast Timeline

Upcoming Risks

Projected Savings

Projected Cash Flow

Projected Financial Health

\====================================================

VISUALIZATIONS

Forecast line chart

Savings curve

Expense trend

Income trend

Cash flow graph

Scenario comparison

\====================================================

PERFORMANCE

Cache expensive calculations.

Avoid recalculating unchanged periods.

\====================================================

ARCHITECTURE

Separate:

Forecast Engine

Prediction Service

Scenario Engine

Simulation Engine

AI Explanation Layer

Forecast Repository

Forecast History

\====================================================

Do NOT place prediction logic inside React components.

\====================================================

TESTING

Generate:

Unit tests

Integration tests

Scenario tests

Performance tests

Edge cases

\====================================================

ACCEPTANCE CRITERIA

✓ Forecasts generated correctly

✓ Scenario simulation works

✓ Dashboard integration complete

✓ AI explanations available

✓ Risks identified

✓ Existing functionality unchanged

✓ npm run build succeeds

✓ npm run dev succeeds

\====================================================

OUTPUT

Implement complete production-ready code.

Include:

Backend

Frontend

Database updates (only if required)

Migration (only if required)

Tests

Documentation

Follow the existing architecture.

Do not modify unrelated modules.

# Milestone 2.5

This is the sprint where your product starts to feel **AI-native**.

But I want to change the architecture.

Most people build:

User → LLM → Response

That is **not** how a financial application should work.

Instead:

User Data  
      │  
      ▼  
Financial Engines  
      │  
      ├── Financial Health Engine  
      ├── Spending Intelligence Engine  
      ├── Recommendation Engine  
      └── Forecasting Engine  
      │  
      ▼  
Financial Context Builder  
      │  
      ▼  
AI Insight Engine  
      │  
      ▼  
LLM  
      │  
      ▼  
Explainable Financial Insights

The AI **never performs financial calculations**.

The deterministic engines do the calculations.

The AI only:

* Explains  
* Summarizes  
* Educates  
* Personalizes  
* Prioritizes

That is much safer and more maintainable.

---

# **Prompt 020 — Sprint 2.5: AI Insight & Explanation Engine (AIEE)**

You are an elite AI engineering organization composed of:

• Chief AI Engineer  
• Principal LLM Engineer  
• Principal Software Engineer  
• Principal Backend Engineer  
• Principal Frontend Engineer  
• Principal Prompt Engineer  
• AI Safety Engineer  
• FinTech AI Specialist  
• UX Engineer  
• QA Engineer

\====================================================

PROJECT

Smart Personal Finance Analyzer

\====================================================

IMPORTANT

The application is fully working.

The following deterministic systems already exist:

✓ Financial Health Score Engine

✓ Spending Intelligence Engine

✓ Financial Recommendation Engine

✓ Financial Forecasting Engine

These systems are the source of truth.

The AI MUST NEVER replace them.

The AI only consumes their outputs.

\====================================================

SPRINT

Sprint 2.5

AI Insight & Explanation Engine (AIEE)

\====================================================

OBJECTIVE

Build an AI layer that converts structured financial analysis into clear, personalized, trustworthy explanations.

This sprint does NOT implement a general-purpose chatbot.

It implements explainable financial intelligence.

\====================================================

AI RESPONSIBILITIES

Generate:

Monthly financial summaries

Weekly summaries

Budget explanations

Forecast explanations

Recommendation explanations

Financial health explanations

Trend explanations

Category summaries

Risk explanations

Achievement summaries

Positive reinforcement

Educational explanations

\====================================================

THE AI MUST NEVER

Calculate money

Calculate percentages

Calculate budgets

Calculate forecasts

Generate fake financial data

Invent transactions

Invent recommendations

Ignore deterministic engine outputs

Provide legal advice

Provide tax advice

Provide investment advice

Guarantee financial outcomes

\====================================================

AI INPUT

The AI receives structured context only.

Example:

Current Financial Health Score

Spending trends

Forecast outputs

Recommendations

Recent transactions summary

Budget status

Goals (future)

Risk analysis

\====================================================

AI OUTPUT

For every response generate:

Title

Short Summary

Detailed Explanation

Key Findings

Important Numbers

Reasoning

Recommended Actions

Confidence

Limitations

Educational Tip

\====================================================

PERSONALIZATION

Adapt explanations to:

Student

Young Professional

Freelancer

Future user types

\====================================================

VOICE

Professional

Friendly

Calm

Supportive

Action-oriented

Clear

Non-judgmental

\====================================================

CONFIDENCE

Every response must include:

Confidence

Evidence

Data Sources

Assumptions

\====================================================

EXPLAINABILITY

Every insight must answer:

Why?

How?

What changed?

What should I do?

What happens if I do nothing?

\====================================================

AI PROMPT SYSTEM

Implement:

Prompt templates

Prompt versioning

Prompt repository

Context builder

Token optimization

Fallback prompts

Localization-ready prompts

\====================================================

CONTEXT MANAGEMENT

Separate:

User profile

Financial summary

Recommendations

Forecast

Spending analysis

Risk analysis

\====================================================

DASHBOARD

Create an AI Insights feed.

Display:

Daily Insight

Weekly Insight

Monthly Summary

Top Recommendation

Upcoming Risk

Positive Achievement

\====================================================

AI HISTORY

Store:

Prompt version

Context version

Generated insight

Timestamp

Feedback

\====================================================

USER FEEDBACK

Allow:

Helpful

Not Helpful

Regenerate

Dismiss

Save

\====================================================

ARCHITECTURE

Separate:

Context Builder

Prompt Builder

Prompt Repository

AI Service

Provider Layer

Insight Formatter

Insight Repository

Feedback Service

Do NOT mix AI prompts into UI components.

\====================================================

PERFORMANCE

Cache repeated prompts.

Reuse context.

Avoid duplicate AI requests.

\====================================================

AI SAFETY

Prevent:

Hallucinations

Prompt injection

Sensitive data leakage

Prompt abuse

Unsafe financial recommendations

\====================================================

TESTING

Generate:

Unit tests

Prompt tests

Integration tests

Regression tests

Edge cases

\====================================================

ACCEPTANCE CRITERIA

✓ AI uses deterministic engine outputs only

✓ Explanations are generated

✓ Dashboard AI feed works

✓ Prompt versioning implemented

✓ Feedback captured

✓ Existing functionality unchanged

✓ npm run build succeeds

✓ npm run dev succeeds

\====================================================

OUTPUT

Implement complete production-ready code.

Include:

Backend

Frontend

Database changes (only if required)

Prompt templates

Tests

Documentation

Do not modify unrelated modules.

Follow the existing architecture.

---

