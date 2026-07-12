# Phase 3 Roadmap part 1

**Phase 3 Roadmap part 1**

Sprint 3.1  
Goal Planning Engine  
Sprint 3.2  
Emergency Fund Planner  
Sprint 3.3  
Subscription Intelligence  
Sprint 3.4  
Receipt OCR Pipeline  
Sprint 3.5  
Import / Export Center  
Sprint 3.6  
Notification & Automation Engine  
Sprint 3.7  
Financial Calendar  
Sprint 3.8  
Life Events Planner  
Notice something:  
Everything is still deterministic.  
The AI only explains.  
**Prompt 021 — Sprint 3.1: Financial Goal Planning Engine (FGPE)**

You are an elite software engineering organization consisting of:  
• Principal Software Architect  
• Principal Backend Engineer  
• Principal Frontend Engineer  
• Principal AI Engineer  
• Principal FinTech Engineer  
• Product Manager  
• UX Designer  
• QA Engineer  
• Security Engineer  
\====================================================  
PROJECT  
Smart Personal Finance Analyzer  
\====================================================  
IMPORTANT  
The application is production-ready for Phase 2\.  
The following engines already exist:  
✓ Financial Health Engine  
✓ Spending Intelligence Engine  
✓ Recommendation Engine  
✓ Forecasting Engine  
✓ AI Insight Engine  
Do NOT redesign architecture.  
Do NOT replace existing modules.  
Extend the current architecture only.  
\====================================================  
SPRINT  
Sprint 3.1  
Financial Goal Planning Engine  
\====================================================  
OBJECTIVE  
Build a comprehensive goal management system that helps users define, monitor, forecast, and achieve financial goals.  
Goals should be first-class entities in the application and integrate with forecasting, recommendations, AI insights, and the Financial Health Score.  
\====================================================  
SUPPORTED GOAL TYPES  
Emergency Fund  
Vacation  
Vehicle  
Laptop  
Education  
Wedding  
Home  
Investment  
Debt Repayment  
Retirement  
Custom Goals  
\====================================================  
FOR EVERY GOAL  
Store:  
Unique ID  
Goal Name  
Goal Type  
Target Amount  
Current Amount  
Currency  
Priority  
Deadline  
Status  
Progress  
Expected Completion  
Estimated Monthly Contribution  
Actual Monthly Contribution  
Forecast Completion  
Created Date  
Updated Date  
\====================================================  
GOAL STATUS  
Planning  
Active  
Behind Schedule  
Ahead of Schedule  
Completed  
Paused  
Archived  
Cancelled  
\====================================================  
GOAL PRIORITY  
Critical  
High  
Medium  
Low  
\====================================================  
GOAL PROGRESS  
Automatically calculate:  
Progress %  
Remaining Amount  
Remaining Months  
Average Monthly Saving  
Forecast Completion Date  
\====================================================  
INTEGRATIONS  
The Goal Engine must integrate with:  
Financial Health Engine  
Forecasting Engine  
Recommendation Engine  
AI Insight Engine  
Dashboard  
\====================================================  
SMART SUGGESTIONS  
Generate deterministic recommendations such as:  
Increase monthly savings by ₹2,000.  
Reduce restaurant spending by ₹1,500.  
Delay non-essential purchases.  
Reallocate surplus income.  
Adjust budget categories.  
\====================================================  
AI EXPLANATIONS  
AI should explain:  
Current progress  
Why progress changed  
Risks  
Expected completion  
Ways to improve  
Alternative strategies  
The AI must never invent numbers.  
\====================================================  
DASHBOARD  
Create:  
Goals Overview  
Priority Goals  
Progress Timeline  
Completion Forecast  
Risk Alerts  
\====================================================  
VISUALIZATIONS  
Progress Ring  
Savings Timeline  
Forecast Curve  
Milestone Timeline  
Contribution History  
\====================================================  
MILESTONES  
Automatically generate milestones.  
Example:  
10%  
25%  
50%  
75%  
100%  
Allow custom milestones.  
\====================================================  
RISK DETECTION  
Detect:  
Missed contributions  
Insufficient savings  
Delayed completion  
Changing income  
Overspending  
\====================================================  
ARCHITECTURE  
Separate:  
Goal Engine  
Goal Forecast Service  
Goal Recommendation Service  
Goal Analytics  
Goal Repository  
Goal History  
Do NOT place business logic inside React components.  
\====================================================  
TESTING  
Generate:  
Unit tests  
Integration tests  
Scenario tests  
Performance tests  
\====================================================  
ACCEPTANCE CRITERIA  
✓ Users can create goals  
✓ Progress updates automatically  
✓ Forecasts work  
✓ Recommendations work  
✓ AI explanations work  
✓ Dashboard integration complete  
✓ Existing functionality unchanged  
✓ npm run build succeeds  
✓ npm run dev succeeds  
\====================================================  
OUTPUT  
Implement complete production-ready code.  
Include:  
Backend  
Frontend  
Database migrations  
Tests  
Documentation  
Follow the existing architecture.  
Do not modify unrelated modules.  
**Prompt 022 — Sprint 3.2: Emergency Fund & Financial Resilience Engine (EFFRE)**  
You are an elite software engineering organization consisting of:  
• Principal Software Architect  
• Principal Backend Engineer  
• Principal Frontend Engineer  
• Principal AI Engineer  
• Principal FinTech Engineer  
• Principal Data Scientist  
• Product Manager  
• UX Designer  
• QA Engineer  
• Security Engineer  
\====================================================  
PROJECT  
Smart Personal Finance Analyzer  
\====================================================  
IMPORTANT  
The application is fully functional.  
The following systems already exist:  
✓ Financial Health Score Engine  
✓ Spending Intelligence Engine  
✓ Financial Recommendation Engine  
✓ Financial Forecasting Engine  
✓ AI Insight Engine  
✓ Financial Goal Planning Engine  
Do NOT redesign the architecture.  
Do NOT replace existing modules.  
Do NOT modify authentication.  
Do NOT introduce breaking database changes.  
Build incrementally on top of the current architecture.  
\====================================================  
SPRINT  
Sprint 3.2  
Emergency Fund & Financial Resilience Engine (EFFRE)  
\====================================================  
OBJECTIVE  
Build a complete Emergency Fund & Financial Resilience Engine that helps users measure, build, monitor, and forecast emergency preparedness.  
The system must calculate emergency readiness using deterministic financial calculations.  
AI must explain the results but must never calculate them.  
\====================================================  
CORE FEATURES  
Emergency Fund Dashboard  
Emergency Readiness Score  
Coverage Analysis  
Target Fund Planner  
Monthly Contribution Planner  
Progress Tracking  
Forecast Completion  
Risk Detection  
Scenario Simulation  
AI Explanations  
\====================================================  
CALCULATE  
Monthly Essential Expenses  
Emergency Fund Target  
Current Emergency Fund  
Coverage Duration  
Savings Rate  
Monthly Contribution  
Completion Forecast  
Emergency Readiness Score  
\====================================================  
DEFAULT TARGETS  
3 Months  
6 Months  
9 Months  
12 Months  
Allow custom targets.  
\====================================================  
EMERGENCY READINESS SCORE  
Generate a score from:  
0–100  
Score Categories  
Excellent  
Good  
Moderate  
Low  
Critical  
\====================================================  
COVERAGE ANALYSIS  
Display:  
Current Cash Reserve  
Months Covered  
Target Months  
Remaining Amount  
Estimated Completion  
\====================================================  
SCENARIO SIMULATOR  
Allow users to simulate:  
Job Loss  
Medical Emergency  
Unexpected Repair  
Income Reduction  
Large One-Time Expense  
Temporary Income Pause  
For each scenario calculate:  
Cash Remaining  
Months Covered  
Financial Risk  
Recovery Timeline  
Suggested Actions  
\====================================================  
RISK DETECTION  
Detect:  
Emergency fund below target  
Rapid depletion  
Negative cash flow  
High recurring obligations  
Insufficient liquidity  
Delayed progress  
\====================================================  
SMART RECOMMENDATIONS  
Generate deterministic recommendations such as:  
Increase emergency savings by ₹3,000/month.  
Reduce discretionary spending.  
Pause low-priority goals.  
Delay optional purchases.  
Redirect surplus income.  
Prioritize emergency savings over discretionary goals.  
\====================================================  
AI EXPLANATIONS  
The AI should explain:  
Current preparedness  
Why the score changed  
Risks  
Recommended actions  
Trade-offs  
Expected improvements  
Limitations  
AI must never invent calculations.  
\====================================================  
VISUALIZATIONS  
Emergency Fund Progress  
Coverage Timeline  
Forecast Curve  
Scenario Comparison  
Monthly Contributions  
Risk Trend  
\====================================================  
DASHBOARD  
Add:  
Emergency Fund Card  
Preparedness Score  
Coverage Summary  
Top Risk  
Recommended Action  
Forecast Completion  
\====================================================  
INTEGRATIONS  
Integrate with:  
Financial Health Engine  
Financial Forecasting Engine  
Goal Planning Engine  
Recommendation Engine  
AI Insight Engine  
Dashboard  
\====================================================  
ARCHITECTURE  
Separate:  
Emergency Fund Engine  
Preparedness Calculator  
Scenario Simulator  
Forecast Service  
Recommendation Service  
Analytics Service  
History Repository  
Do NOT place business logic inside React components.  
\====================================================  
DATA HISTORY  
Track:  
Monthly Coverage  
Preparedness Score  
Contribution History  
Forecast History  
Scenario Results  
\====================================================  
TESTING  
Generate:  
Unit Tests  
Integration Tests  
Scenario Tests  
Edge Case Tests  
Performance Tests  
\====================================================  
ACCEPTANCE CRITERIA  
✓ Emergency fund targets configurable  
✓ Coverage calculated correctly  
✓ Preparedness score generated  
✓ Forecasts generated  
✓ Scenario simulator works  
✓ AI explanations generated  
✓ Dashboard integration complete  
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
Database migrations (only if required)  
Tests  
Documentation  
Follow the existing architecture.  
Do not modify unrelated modules.  
**Prompt 023 — Sprint 3.3: Recurring Financial Intelligence Engine (RFIE)**  
You are an elite software engineering organization consisting of:  
• Principal Software Architect  
• Principal Backend Engineer  
• Principal Frontend Engineer  
• Principal AI Engineer  
• Principal FinTech Engineer  
• Principal Data Engineer  
• Product Manager  
• UX Designer  
• QA Engineer  
• Security Engineer  
\====================================================  
PROJECT  
Smart Personal Finance Analyzer  
\====================================================  
IMPORTANT  
The application is fully functional.  
The following systems already exist:  
✓ Financial Health Score Engine  
✓ Spending Intelligence Engine  
✓ Financial Recommendation Engine  
✓ Financial Forecasting Engine  
✓ AI Insight Engine  
✓ Financial Goal Planning Engine  
✓ Emergency Fund & Financial Resilience Engine  
Do NOT redesign the architecture.  
Do NOT replace existing modules.  
Do NOT modify authentication.  
Do NOT introduce breaking database changes.  
Extend the current architecture only.  
\====================================================  
SPRINT  
Sprint 3.3  
Recurring Financial Intelligence Engine (RFIE)  
\====================================================  
OBJECTIVE  
Build a complete engine for detecting, managing, forecasting, and optimizing recurring financial activity.  
The system must automatically identify recurring transactions and provide users with actionable financial insights.  
Deterministic analysis first.  
AI explanations second.  
\====================================================  
SUPPORTED RECURRING ITEMS  
Subscriptions  
Rent  
Utilities  
Internet  
Phone  
Insurance  
Loan EMI  
Credit Card Payments  
Salary  
SIP / Investment Contributions  
Memberships  
Custom Recurring Transactions  
\====================================================  
CORE FEATURES  
Automatic recurring transaction detection  
Manual recurring transaction creation  
Recurring schedule management  
Upcoming payment calendar  
Renewal reminders  
Cost trend analysis  
Recurring spending analytics  
Subscription optimization  
Recurring income tracking  
Recurring payment forecasting  
\====================================================  
AUTOMATIC DETECTION  
Identify recurring transactions based on:  
Merchant similarity  
Amount similarity  
Date pattern  
Frequency  
Transaction history  
Confidence score  
Allow user confirmation before creating a recurring item.  
\====================================================  
FREQUENCIES  
Daily  
Weekly  
Biweekly  
Monthly  
Quarterly  
Semi-Annual  
Annual  
Custom  
\====================================================  
FOR EVERY RECURRING ITEM STORE  
Unique ID  
Name  
Category  
Type (Income / Expense)  
Frequency  
Amount  
Expected Next Date  
Last Paid Date  
Status  
Confidence  
Created Date  
Updated Date  
\====================================================  
STATUS  
Active  
Paused  
Completed  
Cancelled  
Overdue  
\====================================================  
ANALYTICS  
Calculate:  
Monthly recurring expenses  
Yearly recurring expenses  
Recurring income  
Recurring expense ratio  
Largest recurring expenses  
Upcoming obligations  
Missed payments  
\====================================================  
OPTIMIZATION  
Generate deterministic recommendations such as:  
Cancel unused subscription  
Downgrade plan  
Bundle services  
Review annual payment  
Renegotiate contract  
Reduce recurring spending  
\====================================================  
AI EXPLANATIONS  
Explain:  
Why a transaction was detected as recurring  
Recurring spending trends  
Financial impact  
Optimization opportunities  
Upcoming payment risks  
AI must never invent transactions.  
\====================================================  
DASHBOARD  
Create:  
Recurring Payments Card  
Upcoming Payments  
Monthly Commitments  
Recurring Income  
Recurring Expense Breakdown  
Top Optimization Opportunity  
\====================================================  
VISUALIZATIONS  
Monthly recurring spending  
Recurring income vs expenses  
Upcoming payment timeline  
Recurring category breakdown  
Yearly commitment chart  
\====================================================  
CALENDAR  
Display:  
Upcoming payments  
Upcoming income  
Renewals  
Missed payments  
\====================================================  
NOTIFICATIONS  
Prepare infrastructure for future notifications.  
Store notification candidates but do not implement push/email delivery yet.  
\====================================================  
INTEGRATIONS  
Integrate with:  
Financial Health Engine  
Financial Forecasting Engine  
Financial Recommendation Engine  
AI Insight Engine  
Dashboard  
Calendar  
\====================================================  
ARCHITECTURE  
Separate:  
Recurring Detection Engine  
Recurring Schedule Service  
Forecast Service  
Optimization Service  
Analytics Service  
History Repository  
Do NOT place business logic inside React components.  
\====================================================  
DATA HISTORY  
Track:  
Recurring payment history  
Detection history  
Status changes  
Optimization history  
Forecast history  
\====================================================  
TESTING  
Generate:  
Unit Tests  
Integration Tests  
Detection Tests  
Scenario Tests  
Performance Tests  
\====================================================  
ACCEPTANCE CRITERIA  
✓ Recurring transactions detected automatically  
✓ Manual recurring items supported  
✓ Calendar displays upcoming obligations  
✓ Analytics generated correctly  
✓ Optimization recommendations available  
✓ AI explanations available  
✓ Dashboard integration complete  
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
Database migrations (only if required)  
Tests  
Documentation  
Follow the existing architecture.  
Do not modify unrelated modules.  
**Prompt 024 — Sprint 3.4: Document Intelligence Pipeline (DIP)**  
You are an elite software engineering organization consisting of:  
• Principal Software Architect  
• Principal AI Engineer  
• Principal OCR Engineer  
• Principal Backend Engineer  
• Principal Frontend Engineer  
• Computer Vision Engineer  
• FinTech Domain Expert  
• UX Engineer  
• QA Engineer  
• Security Engineer  
\====================================================  
PROJECT  
Smart Personal Finance Analyzer  
\====================================================  
IMPORTANT  
The current application is fully working.  
A ReceiptProcessor interface already exists.  
Extend it.  
Do NOT redesign the architecture.  
Do NOT replace existing modules.  
Do NOT modify authentication.  
Do NOT introduce breaking database changes.  
Build incrementally.  
\====================================================  
SPRINT  
Sprint 3.4  
Document Intelligence Pipeline (DIP)  
\====================================================  
OBJECTIVE  
Implement a production-grade document processing pipeline.  
The pipeline must support multiple document types.  
Receipt scanning is Version 1\.  
Architecture must support future expansion.  
\====================================================  
SUPPORTED DOCUMENT TYPES  
Version 1  
✓ Receipts  
Future-ready  
Invoices  
Bank Statements  
Salary Slips  
Insurance Documents  
Investment Statements  
Utility Bills  
Tax Documents  
Other Financial Documents  
\====================================================  
PIPELINE  
Upload  
↓  
Validation  
↓  
Virus Scan Interface  
↓  
OCR  
↓  
Structured Extraction  
↓  
Confidence Evaluation  
↓  
User Review  
↓  
Confirmation  
↓  
Transaction Creation  
\====================================================  
SUPPORTED FILES  
JPEG  
PNG  
WEBP  
PDF  
Maximum size configurable.  
\====================================================  
UPLOAD  
Drag & Drop  
Click Upload  
Camera (future-ready)  
Multiple files  
\====================================================  
OCR EXTRACTION  
Extract:  
Merchant  
Date  
Time  
Currency  
Subtotal  
Tax  
Discount  
Total  
Payment Method  
Receipt Number  
Items (optional)  
\====================================================  
CONFIDENCE  
Generate confidence for every extracted field.  
Examples  
Merchant  
98%  
Total  
100%  
Date  
87%  
Tax  
65%  
\====================================================  
USER REVIEW  
Users can edit extracted fields before saving.  
Highlight low-confidence fields.  
\====================================================  
TRANSACTION CREATION  
Generate transactions only after user confirmation.  
Never auto-save financial records.  
\====================================================  
AI ENHANCEMENT  
The AI may:  
Categorize merchant  
Suggest category  
Explain receipt  
Detect unusual purchases  
Summarize spending  
The AI must never invent extracted values.  
\====================================================  
DASHBOARD  
Add:  
Recent Scans  
Processing Queue  
OCR Accuracy  
Review Required  
\====================================================  
ARCHITECTURE  
Separate:  
Upload Service  
Validation Service  
OCR Provider  
Extraction Engine  
Confidence Engine  
Review Service  
Document Repository  
Transaction Mapper  
\====================================================  
OCR PROVIDER  
Implement provider abstraction.  
Example  
OCRService  
↓  
Provider Adapter  
↓  
Provider A  
Provider B  
Local OCR  
Future providers  
The rest of the application must never depend on a specific OCR vendor.  
\====================================================  
SECURITY  
Validate MIME types  
Validate file size  
Reject executable content  
Prevent path traversal  
Secure temporary storage  
Sanitize metadata  
\====================================================  
PERFORMANCE  
Background processing  
Queue support  
Progress updates  
Retry support  
Failure recovery  
\====================================================  
DATA HISTORY  
Track:  
Upload history  
OCR history  
Review history  
Extraction history  
Processing status  
\====================================================  
TESTING  
Generate:  
Unit Tests  
OCR Tests  
Upload Tests  
Security Tests  
Integration Tests  
Performance Tests  
\====================================================  
ACCEPTANCE CRITERIA  
✓ File upload works  
✓ OCR extracts receipt data  
✓ Confidence scores displayed  
✓ User review works  
✓ Transactions created only after confirmation  
✓ Dashboard updated  
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
Migrations (only if required)  
Tests  
Documentation  
Follow the existing architecture.  
Do not modify unrelated modules.

# Phase 3 Roadmap part 2

**Phase 3 Roadmap part 2**

**Prompt 025 — Sprint 3.5: Financial Data Exchange Platform (FDEP)**  
You are an elite software engineering organization consisting of:  
• Principal Software Architect  
• Principal Backend Engineer  
• Principal Frontend Engineer  
• Principal Data Engineer  
• Principal Integration Engineer  
• Principal AI Engineer  
• FinTech Domain Expert  
• UX Engineer  
• QA Engineer  
• Security Engineer  
\====================================================  
PROJECT  
Smart Personal Finance Analyzer  
\====================================================  
IMPORTANT  
The application is fully functional.  
The following systems already exist:  
✓ Financial Health Engine  
✓ Spending Intelligence Engine  
✓ Financial Recommendation Engine  
✓ Financial Forecasting Engine  
✓ AI Insight Engine  
✓ Goal Planning Engine  
✓ Emergency Fund Engine  
✓ Recurring Financial Intelligence Engine  
✓ Document Intelligence Pipeline  
Do NOT redesign architecture.  
Do NOT replace existing modules.  
Do NOT modify authentication.  
Do NOT introduce breaking database changes.  
Extend the current architecture only.  
\====================================================  
SPRINT  
Sprint 3.5  
Financial Data Exchange Platform (FDEP)  
\====================================================  
OBJECTIVE  
Build a complete platform for importing, exporting, backing up, restoring, and synchronizing financial data.  
Version 1 should provide high-quality local import/export capabilities while remaining extensible for future integrations.  
\====================================================  
SUPPORTED IMPORT FORMATS  
Version 1  
CSV  
JSON  
Future-ready  
Excel (.xlsx)  
PDF Statements  
Bank Statements  
Open Banking  
Google Sheets  
Investment Brokers  
Tax Software  
\====================================================  
SUPPORTED EXPORT FORMATS  
CSV  
JSON  
PDF Financial Report  
Future-ready  
Excel  
Tax Reports  
Portfolio Reports  
Open API  
\====================================================  
IMPORT WORKFLOW  
Upload  
↓  
Validation  
↓  
File Parsing  
↓  
Schema Validation  
↓  
Duplicate Detection  
↓  
Preview  
↓  
User Confirmation  
↓  
Import Execution  
↓  
Summary  
\====================================================  
EXPORT WORKFLOW  
Choose Dataset  
↓  
Apply Filters  
↓  
Select Format  
↓  
Generate File  
↓  
Download  
\====================================================  
SUPPORTED DATASETS  
Transactions  
Categories  
Budgets  
Goals  
Recurring Items  
Recommendations  
Forecast History  
Emergency Fund History  
User Settings  
Application Backup  
\====================================================  
BACKUP  
Create full application backups.  
Support:  
Manual backup  
Scheduled backup infrastructure (future-ready)  
Version history  
Backup metadata  
\====================================================  
RESTORE  
Restore selected datasets.  
Allow preview before restoration.  
Support partial restore.  
Prevent accidental overwrites.  
\====================================================  
IMPORT VALIDATION  
Validate:  
Headers  
Required columns  
Data types  
Currency  
Dates  
Amounts  
Duplicate records  
Foreign key relationships  
\====================================================  
DUPLICATE DETECTION  
Detect:  
Exact duplicates  
Probable duplicates  
Manual review  
Merge options  
\====================================================  
IMPORT PREVIEW  
Display:  
Rows to import  
Rows with warnings  
Rows with errors  
Duplicate count  
Summary statistics  
\====================================================  
EXPORT OPTIONS  
Date range  
Categories  
Accounts  
Goal status  
Budgets  
Custom filters  
\====================================================  
PDF REPORTS  
Generate professional financial reports including:  
Income  
Expenses  
Budget performance  
Financial Health Score  
Forecast summary  
Goals  
Recommendations  
AI insights  
\====================================================  
SECURITY  
Validate file type  
Validate file size  
Sanitize uploaded files  
Prevent malicious uploads  
Audit all import/export actions  
\====================================================  
ARCHITECTURE  
Separate:  
Import Engine  
Export Engine  
Parser Service  
Validation Service  
Duplicate Detection Service  
Backup Service  
Restore Service  
Exchange Repository  
Do NOT place import/export logic inside React components.  
\====================================================  
INTEGRATIONS  
Integrate with:  
Document Intelligence Pipeline  
Financial Forecasting Engine  
Financial Health Engine  
Dashboard  
AI Insight Engine  
\====================================================  
AUDIT  
Track:  
Imports  
Exports  
Backups  
Restores  
Failures  
Validation errors  
\====================================================  
PERFORMANCE  
Support large datasets.  
Process imports in batches.  
Provide progress indicators.  
Allow cancellation where appropriate.  
\====================================================  
TESTING  
Generate:  
Unit Tests  
Parser Tests  
Validation Tests  
Import Tests  
Export Tests  
Backup/Restore Tests  
Performance Tests  
\====================================================  
ACCEPTANCE CRITERIA  
✓ CSV import works  
✓ JSON import works  
✓ CSV export works  
✓ JSON export works  
✓ PDF report generation works  
✓ Duplicate detection works  
✓ Backup and restore work  
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
Migrations (only if required)  
Tests  
Documentation  
Follow the existing architecture.  
Do not modify unrelated modules.  
**Prompt 026 — Sprint 3.6: Automation, Notification & Workflow Engine (ANWE)**

You are an elite software engineering organization consisting of:  
• Principal Software Architect  
• Principal Backend Engineer  
• Principal Frontend Engineer  
• Principal AI Engineer  
• Principal Workflow Engineer  
• Principal Notification Engineer  
• Principal DevOps Engineer  
• Product Manager  
• UX Engineer  
• QA Engineer  
• Security Engineer  
\====================================================  
PROJECT  
Smart Personal Finance Analyzer  
\====================================================  
IMPORTANT  
The application is fully functional.  
The following systems already exist:  
✓ Financial Health Engine  
✓ Spending Intelligence Engine  
✓ Financial Recommendation Engine  
✓ Financial Forecasting Engine  
✓ AI Insight Engine  
✓ Goal Planning Engine  
✓ Emergency Fund Engine  
✓ Recurring Financial Intelligence Engine  
✓ Document Intelligence Pipeline  
✓ Financial Data Exchange Platform  
Do NOT redesign architecture.  
Do NOT replace existing modules.  
Do NOT modify authentication.  
Do NOT introduce breaking database changes.  
Extend the existing architecture only.  
\====================================================  
SPRINT  
Sprint 3.6  
Automation, Notification & Workflow Engine (ANWE)  
\====================================================  
OBJECTIVE  
Build a reusable automation platform capable of detecting events, evaluating rules, scheduling jobs, and delivering notifications.  
Notifications are only one output.  
The engine must be reusable for future workflow automation.  
\====================================================  
ARCHITECTURE  
Implement a layered architecture.  
Event Sources  
↓  
Event Bus  
↓  
Rule Engine  
↓  
Automation Engine  
↓  
Scheduler  
↓  
Notification Dispatcher  
↓  
Delivery Channels  
\====================================================  
EVENT SOURCES  
Transaction Created  
Transaction Updated  
Budget Exceeded  
Budget Near Limit  
Goal Progress Changed  
Goal Completed  
Financial Score Changed  
Recommendation Created  
Emergency Fund Changed  
Recurring Payment Due  
Forecast Risk Detected  
Document Processed  
Import Completed  
Export Completed  
\====================================================  
RULE ENGINE  
Support deterministic rules.  
Examples:  
Budget \> 90%  
↓  
Notify user  
\--------------------------------  
Goal delayed  
↓  
Generate reminder  
\--------------------------------  
Emergency fund below target  
↓  
Generate recommendation  
\--------------------------------  
Salary received  
↓  
Refresh dashboard  
Generate AI summary (future-ready)  
\====================================================  
WORKFLOW ENGINE  
Support:  
Immediate actions  
Delayed actions  
Scheduled actions  
Conditional actions  
Repeatable workflows  
Future custom workflows  
\====================================================  
SCHEDULER  
Support:  
One-time jobs  
Daily  
Weekly  
Monthly  
Quarterly  
Yearly  
Custom schedules  
Timezone aware  
Retry failed jobs  
\====================================================  
NOTIFICATION CHANNELS  
Version 1  
In-app notifications  
Email infrastructure  
Future-ready  
Push notifications  
SMS  
WhatsApp  
Slack  
Webhook  
Calendar  
\====================================================  
NOTIFICATION TYPES  
Information  
Warning  
Critical  
Success  
Reminder  
Recommendation  
Achievement  
Forecast Alert  
Security Alert  
\====================================================  
USER PREFERENCES  
Allow configuration for:  
Enabled channels  
Quiet hours  
Timezone  
Frequency  
Categories  
Digest mode  
\====================================================  
AI AUTOMATION  
Generate:  
Weekly financial summary  
Monthly financial summary  
Goal progress summary  
Budget explanation  
Forecast summary  
Risk explanation  
Do NOT build AI chat.  
\====================================================  
WORKFLOW HISTORY  
Track:  
Trigger  
Execution  
Result  
Notification sent  
Delivery status  
Failures  
Retries  
\====================================================  
DASHBOARD  
Add:  
Notification Center  
Automation Status  
Upcoming Scheduled Tasks  
Recent Workflow Activity  
\====================================================  
AUDIT  
Track:  
Every workflow execution  
Notification delivery  
Rule evaluation  
Failures  
Manual dismissals  
\====================================================  
SECURITY  
Prevent notification spam.  
Rate limit notifications.  
Deduplicate repeated alerts.  
Validate workflow permissions.  
\====================================================  
PERFORMANCE  
Queue background work.  
Support retries.  
Support exponential backoff.  
Avoid blocking user requests.  
\====================================================  
ARCHITECTURE  
Separate:  
Event Bus  
Rule Engine  
Automation Engine  
Scheduler  
Notification Service  
Delivery Providers  
Workflow History  
Preferences Service  
Do NOT place automation logic inside UI components.  
\====================================================  
TESTING  
Generate:  
Unit Tests  
Workflow Tests  
Scheduler Tests  
Notification Tests  
Rule Engine Tests  
Performance Tests  
\====================================================  
ACCEPTANCE CRITERIA  
✓ Event system works  
✓ Rule engine works  
✓ Scheduler works  
✓ In-app notifications work  
✓ Email infrastructure ready  
✓ Dashboard updated  
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
Migrations (only if required)  
Tests  
Documentation  
Follow the existing architecture.  
Do not modify unrelated modules.  
**Prompt 027 — Sprint 3.7: Financial Timeline & Planning Engine (FTPE)**  
You are an elite software engineering organization consisting of:  
• Principal Software Architect  
• Principal Backend Engineer  
• Principal Frontend Engineer  
• Principal AI Engineer  
• Principal Product Engineer  
• Principal UX Designer  
• Principal Data Engineer  
• FinTech Domain Expert  
• QA Engineer  
• Security Engineer  
\====================================================  
PROJECT  
Smart Personal Finance Analyzer  
\====================================================  
IMPORTANT  
The application is fully functional.  
The following systems already exist:  
✓ Financial Health Engine  
✓ Spending Intelligence Engine  
✓ Financial Recommendation Engine  
✓ Financial Forecasting Engine  
✓ AI Insight Engine  
✓ Goal Planning Engine  
✓ Emergency Fund Engine  
✓ Recurring Financial Intelligence Engine  
✓ Document Intelligence Pipeline  
✓ Financial Data Exchange Platform  
✓ Automation, Notification & Workflow Engine  
Do NOT redesign architecture.  
Do NOT replace existing modules.  
Do NOT modify authentication.  
Do NOT introduce breaking database changes.  
Extend the current architecture only.  
\====================================================  
SPRINT  
Sprint 3.7  
Financial Timeline & Planning Engine (FTPE)  
\====================================================  
OBJECTIVE  
Build a unified financial timeline that combines historical events, current activities, future plans, scheduled obligations, and forecasts into a single planning experience.  
The timeline becomes the central planning surface of the application.  
\====================================================  
TIMELINE EVENT TYPES  
Income Received  
Expense Recorded  
Recurring Payment  
Budget Milestone  
Goal Milestone  
Goal Completion  
Recommendation Generated  
Financial Health Change  
Forecast Risk  
Emergency Fund Milestone  
Document Processed  
Import  
Export  
Scheduled Reminder  
AI Summary  
Future-ready:  
Tax Due  
Insurance Renewal  
Investment Maturity  
Loan EMI  
Salary Cycle  
\====================================================  
TIMELINE VIEWS  
Daily  
Weekly  
Monthly  
Quarterly  
Yearly  
Agenda  
Timeline  
Calendar  
Future Planning  
\====================================================  
FOR EVERY EVENT STORE  
Unique ID  
Title  
Description  
Category  
Priority  
Timestamp  
Related Entity  
Related Module  
Status  
Source  
Metadata  
\====================================================  
EVENT STATUS  
Upcoming  
Scheduled  
Completed  
Cancelled  
Missed  
Overdue  
\====================================================  
PLANNING FEATURES  
Upcoming Financial Events  
Monthly Planning  
Cash Flow Timeline  
Budget Timeline  
Goal Timeline  
Recurring Commitments  
Forecast Milestones  
\====================================================  
SMART PLANNING  
Generate deterministic planning suggestions.  
Examples  
Move discretionary spending after salary.  
Reschedule savings contribution.  
Prepare for upcoming insurance payment.  
Increase emergency savings before forecast deficit.  
\====================================================  
AI EXPLANATIONS  
The AI should explain:  
Why an event matters  
Expected impact  
Preparation advice  
Dependencies  
Suggested actions  
Alternative plans  
The AI must never invent financial events.  
\====================================================  
VISUALIZATIONS  
Interactive timeline  
Financial calendar  
Cash flow timeline  
Goal roadmap  
Budget milestones  
Upcoming commitments  
Forecast timeline  
\====================================================  
DASHBOARD  
Add:  
Upcoming Events  
Financial Timeline Preview  
Today's Priorities  
This Week  
This Month  
Upcoming Risks  
\====================================================  
SEARCH  
Allow filtering by:  
Date  
Category  
Priority  
Module  
Status  
\====================================================  
INTEGRATIONS  
Integrate with:  
Automation Engine  
Goal Engine  
Forecasting Engine  
Recommendation Engine  
Recurring Engine  
Emergency Fund Engine  
Dashboard  
\====================================================  
ARCHITECTURE  
Separate:  
Timeline Engine  
Planning Service  
Timeline Repository  
Calendar Service  
Event Aggregator  
Planning Analytics  
Do NOT place planning logic inside React components.  
\====================================================  
HISTORY  
Track:  
Event creation  
Status changes  
User actions  
AI explanations  
Planning updates  
\====================================================  
PERFORMANCE  
Virtualize large timelines.  
Cache aggregated views.  
Lazy-load historical data.  
\====================================================  
TESTING  
Generate:  
Unit Tests  
Timeline Tests  
Planning Tests  
Integration Tests  
Performance Tests  
Accessibility Tests  
\====================================================  
ACCEPTANCE CRITERIA  
✓ Unified timeline generated  
✓ Calendar view works  
✓ Agenda view works  
✓ Planning suggestions generated  
✓ AI explanations available  
✓ Dashboard updated  
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
Migrations (only if required)  
Tests  
Documentation  
Follow the existing architecture.  
Do not modify unrelated modules.  
**Prompt 028 — Sprint 3.8: Life Planning & Financial Scenario Engine (LPFSE)**  
You are an elite software engineering organization consisting of:  
• Principal Software Architect  
• Principal AI Engineer  
• Principal Backend Engineer  
• Principal Frontend Engineer  
• Principal FinTech Engineer  
• Principal Data Scientist  
• Product Manager  
• UX Designer  
• QA Engineer  
• Security Engineer  
\====================================================  
PROJECT  
Smart Personal Finance Analyzer  
\====================================================  
IMPORTANT  
The application is fully functional.  
The following systems already exist:  
✓ Financial Health Engine  
✓ Spending Intelligence Engine  
✓ Financial Recommendation Engine  
✓ Financial Forecasting Engine  
✓ AI Insight Engine  
✓ Financial Goal Planning Engine  
✓ Emergency Fund & Financial Resilience Engine  
✓ Recurring Financial Intelligence Engine  
✓ Document Intelligence Pipeline  
✓ Financial Data Exchange Platform  
✓ Automation, Notification & Workflow Engine  
✓ Financial Timeline & Planning Engine  
Do NOT redesign architecture.  
Do NOT replace existing modules.  
Do NOT modify authentication.  
Do NOT introduce breaking database changes.  
Extend the current architecture only.  
\====================================================  
SPRINT  
Sprint 3.8  
Life Planning & Financial Scenario Engine (LPFSE)  
\====================================================  
OBJECTIVE  
Build a comprehensive engine that allows users to model future life events, compare financial scenarios, and understand the long-term impact of major decisions.  
The engine must support deterministic financial simulations.  
AI explains the outcomes but does not perform financial calculations.  
\====================================================  
SUPPORTED SCENARIOS  
Buying a House  
Buying a Vehicle  
Marriage  
Children  
Higher Education  
Career Change  
Job Loss  
Salary Increase  
Business Startup  
Relocation  
Retirement  
Debt Payoff  
Large Purchase  
Custom Scenario  
\====================================================  
FOR EVERY SCENARIO STORE  
Unique ID  
Scenario Name  
Scenario Type  
Description  
Start Date  
Duration  
Priority  
Assumptions  
Estimated Cost  
Expected Income Impact  
Expected Expense Impact  
Status  
Created Date  
Updated Date  
\====================================================  
SCENARIO STATUS  
Draft  
Planned  
Active  
Completed  
Archived  
Cancelled  
\====================================================  
SIMULATIONS  
Calculate:  
Cash Flow Impact  
Savings Impact  
Budget Impact  
Emergency Fund Impact  
Goal Impact  
Financial Health Score Impact  
Forecast Impact  
\====================================================  
MULTI-SCENARIO COMPARISON  
Allow users to compare:  
Scenario A  
Scenario B  
Scenario C  
Display:  
Financial impact  
Risk  
Completion probability  
Cash flow  
Goal delays  
Savings  
\====================================================  
WHAT-IF ANALYSIS  
Examples  
Buy a house in 2 years.  
Increase salary by 20%.  
Reduce discretionary spending by ₹5,000/month.  
Delay retirement by 3 years.  
Pay off debt early.  
Start a business.  
\====================================================  
RISK ANALYSIS  
Identify:  
Cash shortages  
Goal conflicts  
Budget conflicts  
Emergency fund depletion  
Forecast deterioration  
Financial health decline  
\====================================================  
AI EXPLANATIONS  
Explain:  
Scenario impact  
Trade-offs  
Advantages  
Disadvantages  
Financial risks  
Preparation advice  
Alternative strategies  
The AI must never invent financial values.  
\====================================================  
VISUALIZATIONS  
Scenario comparison  
Timeline  
Cash flow projection  
Savings projection  
Goal impact  
Financial health trend  
\====================================================  
DASHBOARD  
Add:  
Scenario Center  
Active Plans  
Upcoming Life Events  
Recommended Planning Actions  
Risk Summary  
\====================================================  
ARCHITECTURE  
Separate:  
Scenario Engine  
Simulation Service  
Comparison Service  
Risk Analysis Service  
Planning Repository  
Scenario History  
Do NOT place simulation logic inside React components.  
\====================================================  
INTEGRATIONS  
Integrate with:  
Financial Forecasting Engine  
Goal Planning Engine  
Emergency Fund Engine  
Recommendation Engine  
AI Insight Engine  
Timeline Engine  
Automation Engine  
\====================================================  
HISTORY  
Track:  
Scenario creation  
Simulation results  
Comparison history  
Assumption changes  
User decisions  
\====================================================  
PERFORMANCE  
Cache repeated simulations.  
Allow asynchronous long-running calculations.  
Optimize comparison queries.  
\====================================================  
TESTING  
Generate:  
Unit Tests  
Simulation Tests  
Comparison Tests  
Scenario Tests  
Integration Tests  
Performance Tests  
\====================================================  
ACCEPTANCE CRITERIA  
✓ Users can create scenarios  
✓ Simulations generate correctly  
✓ Scenario comparison works  
✓ Risk analysis works  
✓ AI explanations available  
✓ Dashboard integration complete  
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
Database migrations (only if required)  
Tests  
Documentation  
Follow the existing architecture.  
Do not modify unrelated modules.

