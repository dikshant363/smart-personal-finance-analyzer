**MASTER PROMPT — Architecture Refactoring, Repository Standardization & Platform Audit**

You are an elite software architecture organization consisting of:

* Chief Technology Officer  
* VP Engineering  
* Distinguished Software Architect  
* Principal Backend Engineer  
* Principal Frontend Engineer  
* Principal Mobile Engineer  
* Principal Platform Engineer  
* Principal AI Engineer  
* Principal DevOps Engineer  
* Principal Security Engineer  
* Principal Performance Engineer  
* Principal QA Engineer  
* Principal Accessibility Engineer  
* Principal Documentation Engineer

**PROJECT**

Smart Personal Finance Analyzer  
Current Version  
v10.0.0  
Architecture  
Multi-Platform Experience Platform (MPEP)  
Primary Country  
India  
Primary Currency  
INR  
**PRIMARY OBJECTIVE**

Perform a COMPLETE repository audit.  
Do NOT implement new features.  
Do NOT redesign business functionality.  
Instead:  
Perform a production-grade architectural refactoring.  
The objective is to make this repository equivalent to what would be expected from a mature open-source project.  
**PHASE 1**

COMPLETE ARCHITECTURE AUDIT  
Read the ENTIRE repository.  
Do not skip files.  
Inspect:

* Folder structure  
* Naming conventions  
* Imports  
* Dependencies  
* Build system  
* Tests  
* Documentation  
* Assets  
* Configurations  
* Generated files  
* Dead code  
* Duplicate logic  
* Platform boundaries  
* Security  
* Performance

Produce an Architecture Audit Report before changing anything.  
**PHASE 2**

DETECT PROBLEMS  
Detect every issue including but not limited to:  
Architecture smells  
Circular dependencies  
Dead code  
Unused components  
Duplicate utilities  
Duplicate hooks  
Duplicate services  
Incorrect abstractions  
Poor naming  
Broken module boundaries  
Incorrect folder hierarchy  
Large files  
Mixed responsibilities  
Unused assets  
Unused icons  
Unused CSS  
Incorrect imports  
Broken exports  
Leaking platform code into domain logic  
Business logic inside UI  
Business logic inside components  
Platform-specific logic inside shared packages  
Improper dependency direction  
Improper layering  
Poor test structure  
Poor documentation  
Broken ADRs  
Security issues  
Performance issues  
Accessibility issues  
False documentation  
Misleading comments  
Fake encryption claims  
Incorrect terminology  
Outdated documentation  
Version inconsistencies  
**PHASE 3**

VERIFY PREVIOUS IMPLEMENTATION CLAIMS  
Verify every engineering claim.  
Examples:  
If documentation says:  
"Base64 encryption"  
Verify.  
If implementation actually uses:  
btoa()  
Buffer.from()  
Then:  
Reject the claim.  
Correct documentation.  
Implement real encryption if required.  
Examples:  
Web Crypto API  
AES-GCM  
Secure Cookies  
Platform Keychain  
Capacitor Secure Storage  
Never allow misleading security terminology.  
Verify:  
Service Worker  
PWA  
Offline Sync  
Biometrics  
Responsive Layouts  
Bundle Size  
Caching  
Performance  
Offline Queue  
AI Architecture  
Knowledge Graph  
Workflow Engine  
Documentation  
Release Notes  
Everything must match reality.  
**PHASE 4**

REPOSITORY STANDARDIZATION  
Rename folders.  
Rename files.  
Rename packages.  
Rename components.  
Rename hooks.  
Rename utilities.  
Rename services.  
Rename tests.  
Rename documentation.  
Use consistent naming.  
Examples:  
Never mix:  
mobile.ts  
device.ts  
platform.ts  
Choose one convention.  
Examples:  
useOfflineQueue.ts  
offlineQueue.ts  
offline-sync.ts  
Standardize.  
Use consistent naming everywhere.  
**PHASE 5**

REPOSITORY REORGANIZATION  
Convert repository into a scalable monorepo architecture.  
Target:  
finance-platform/  
apps/  
web/  
mobile/  
desktop/  
docs/  
packages/  
ui/  
design-system/  
application/  
domain/  
infrastructure/  
platform/  
api-client/  
currency/  
offline/  
notifications/  
charts/  
auth/  
ai/  
workflow/  
knowledge/  
analytics/  
config/  
testing/  
shared/  
services/  
api/  
tooling/  
scripts/  
.github/  
docs/  
No duplicated code.  
No duplicated UI.  
No duplicated business logic.  
**PHASE 6**

ARCHITECTURE LAYER VALIDATION  
Validate strict dependency direction.  
Presentation  
↓  
Platform  
↓  
Application  
↓  
Domain  
↓  
Infrastructure  
Nothing may violate this rule.  
**PHASE 7**

SECURITY AUDIT  
Reject:  
Base64 as encryption  
Hardcoded secrets  
Unsafe local storage  
Unsafe cookies  
Unsafe authentication  
Unsafe authorization  
Weak CSP  
Missing headers  
XSS  
CSRF  
SSRF  
IDOR  
SQL Injection  
Prompt Injection  
PII leaks  
Implement proper fixes.  
**PHASE 8**

MULTI-PLATFORM VALIDATION  
Verify:  
Web  
PWA  
Android readiness  
iOS readiness  
Desktop readiness  
Tablet  
Responsive  
Offline  
Platform adapters  
No platform-specific APIs may leak into business logic.  
**PHASE 9**

INDIA-FIRST VALIDATION  
Verify the platform follows India-first principles.  
Examples:  
₹  
INR  
Indian Financial Year  
Indian Number Format  
UPI  
Indian Banking  
Indian Investments  
Indian Tax  
Indian Insurance  
Indian Reports  
Reject US-centric assumptions.  
**PHASE 10**

DOCUMENTATION RESTRUCTURE  
Instead of large documentation files create:  
docs/  
architecture/  
platform/  
Android.md  
iOS.md  
Desktop.md  
PWA.md  
Responsive.md  
Offline.md  
security/  
performance/  
ai/  
backend/  
frontend/  
database/  
testing/  
release/  
governance/  
contributing/  
Each document should have one responsibility.  
**PHASE 11**

PERFORMANCE AUDIT  
Measure:  
Next.js Build  
First Load JS  
Route Sizes  
Bundle Analysis  
Chunk Sizes  
Memory  
Lazy Loading  
Tree Shaking  
Code Splitting  
Do NOT invent numbers.  
Use actual build outputs.  
**PHASE 12**

ACCESSIBILITY AUDIT  
Validate WCAG AA.  
Keyboard  
Screen Reader  
Focus  
Contrast  
Touch Targets  
ARIA  
Semantic HTML  
**PHASE 13**

CODE QUALITY  
Enforce:  
SOLID  
DRY  
KISS  
YAGNI  
Strict TypeScript  
No any  
No TODO  
No FIXME  
No placeholder  
No dead code  
**PHASE 14**

TESTING  
Run:  
npm install  
npm run lint  
npm run typecheck  
npm test  
npm run test:e2e  
npm run build  
Do not declare success unless every command passes.  
**PHASE 15**

OUTPUT  
Return:

1. Executive Summary  
2. Architecture Audit  
3. Repository Audit  
4. Naming Audit  
5. Security Audit  
6. Performance Audit  
7. Accessibility Audit  
8. Documentation Audit  
9. Dead Code Report  
10. Duplicate Code Report  
11. Folder Reorganization Report  
12. File Rename Report  
13. Files Created  
14. Files Modified  
15. Files Deleted  
16. Architecture Decision Records  
17. Breaking Changes (if any)  
18. Migration Guide  
19. Rollback Guide  
20. Validation Report  
21. Future Recommendations

**FINAL RULE**

Do not preserve poor architecture simply because it already exists.  
If a better architecture is possible while maintaining backward compatibility, implement it.  
Do not optimize for writing more code.  
Optimize for:

* Maintainability  
* Scalability  
* Security  
* Performance  
* Simplicity  
* Developer Experience  
* Open Source Quality  
* India-First Financial Platform  
* Multi-Platform Architecture

The final repository should look like a world-class open-source finance platform rather than a typical Next.js application.  
**Repository Modernization Program — Phase 1: Complete Repository Audit (Read-Only)**

You are an elite software architecture organization consisting of:

* Chief Technology Officer  
* VP Engineering  
* Distinguished Software Architect  
* Principal Backend Engineer  
* Principal Frontend Engineer  
* Principal Mobile Engineer  
* Principal Platform Engineer  
* Principal AI Engineer  
* Principal DevOps Engineer  
* Principal Security Engineer  
* Principal Database Engineer  
* Principal Performance Engineer  
* Principal QA Engineer  
* Principal Accessibility Engineer  
* Principal Documentation Engineer

**PROJECT**

Smart Personal Finance Analyzer  
Architecture:  
India-First Multi-Platform Experience Platform (MPEP)  
Repository Version:  
v10.0.0  
This phase is **READ-ONLY**.  
Do not rename files.  
Do not move folders.  
Do not modify code.  
Do not delete anything.  
Only inspect, analyze, validate, and report.  
**OBJECTIVE**

Completely understand the repository before making any architectural changes.  
Treat the existing repository as the source of truth.  
Never assume documentation is correct.  
Verify every claim against the implementation.  
**PHASE 1 TASKS**

**Repository Inventory**

Inspect the complete repository and produce:

* Directory tree  
* Package inventory  
* Applications  
* Shared libraries  
* Assets  
* Scripts  
* Documentation  
* Tests  
* Configuration files  
* CI/CD configuration

**Architecture Audit**

Verify:

* Layer boundaries  
* Dependency direction  
* Domain separation  
* Platform adapters  
* UI separation  
* Infrastructure separation

Target architecture:  
Presentation  
↓  
Platform  
↓  
Application  
↓  
Domain  
↓  
Infrastructure  
Report every violation.  
**Naming Audit**

Inspect all:

* Files  
* Folders  
* Components  
* Hooks  
* Services  
* Utilities  
* Tests  
* Documentation

Detect inconsistent naming.  
Do not rename anything.  
Only report.  
**Repository Structure Audit**

Determine whether the current repository should remain a single application or evolve into a monorepo.  
If a monorepo is recommended, explain why and identify which modules should become shared packages.  
Do not perform the migration.  
**India-First Audit**

Verify that the platform consistently follows Indian conventions.  
Examples include:

* INR as default currency.  
* Indian numbering system (lakh/crore).  
* Indian financial year (April–March).  
* Indian date and time formats.  
* UPI and Indian payment workflows.  
* Indian investment products.  
* Indian banking terminology.

List any areas that still assume non-Indian defaults.  
**Security Audit**

Validate:

* Authentication.  
* Authorization.  
* Secret handling.  
* Local storage.  
* Cookies.  
* Encryption.  
* Input validation.  
* Output encoding.  
* CSP.  
* XSS.  
* CSRF.  
* SSRF.  
* SQL injection protection.

Specifically verify any documentation that claims encryption or other security properties against the implementation.  
**Multi-Platform Audit**

Verify:

* Responsive layouts.  
* PWA support.  
* Platform adapters.  
* Offline support.  
* Device capability abstractions.  
* Desktop readiness.  
* Android readiness.  
* iOS readiness.

Report missing or incomplete pieces.  
**Performance Audit**

Inspect:

* Bundle organization.  
* Code splitting.  
* Lazy loading.  
* Caching.  
* Virtualization.  
* Query efficiency.  
* Build configuration.

Do not estimate performance; identify where measurement is required.  
**Documentation Audit**

Compare documentation with the implementation.  
Identify:

* Outdated documents.  
* Incorrect claims.  
* Missing documentation.  
* Duplicate documentation.  
* Oversized documents that should be split.

**Code Quality Audit**

Identify:

* Dead code.  
* Duplicate logic.  
* Circular dependencies.  
* Oversized files.  
* Mixed responsibilities.  
* Poor abstractions.  
* Technical debt.

Do not fix them.  
**Testing Audit**

Evaluate:

* Unit test coverage.  
* Integration coverage.  
* End-to-end coverage.  
* Accessibility testing.  
* Performance testing.  
* Security testing.

Highlight gaps.  
**OUTPUT**

Return only an audit.  
Do not modify any files.  
Include:

1. Executive Summary.  
2. Repository Inventory.  
3. Architecture Assessment.  
4. India-First Compliance Report.  
5. Security Findings.  
6. Performance Findings.  
7. Documentation Findings.  
8. Code Quality Findings.  
9. Testing Coverage Assessment.  
10. Repository Structure Recommendation.  
11. Prioritized Refactoring Roadmap (Critical, High, Medium, Low).  
12. Risk Assessment.  
13. Proposed Git branches for each future refactoring phase.

If you find issues, recommend them for later phases instead of fixing them now.  
The repository must remain completely unchanged during this phase.  
**Repository Modernization Program — Phase 2: Repository Standardization & Reorganization**

You are an elite software architecture organization consisting of:

* Chief Technology Officer  
* VP Engineering  
* Distinguished Software Architect  
* Principal Platform Engineer  
* Principal Backend Engineer  
* Principal Frontend Engineer  
* Principal Mobile Engineer  
* Principal DevOps Engineer  
* Principal Security Engineer  
* Principal QA Engineer  
* Principal Documentation Engineer

**PROJECT**

Smart Personal Finance Analyzer  
Architecture:  
India-First Multi-Platform Experience Platform (MPEP)  
Current Version:  
v10.0.0  
This phase begins **only after Phase 1 Repository Audit has been completed**.  
**OBJECTIVE**

Standardize the repository structure, naming conventions, documentation layout, and module organization **without changing business functionality**.  
Do not add new product features.  
Do not redesign the financial engine.  
Do not change user workflows.  
Only improve maintainability, consistency, and long-term scalability.  
**INPUT**

Use the findings from the Phase 1 Repository Audit.  
Every modification must reference one or more audit findings.  
If a change is not justified by the audit, do not make it.  
**TASK 1 — STANDARDIZE FILE NAMES**

Rename files to follow one consistent convention.  
Standardize:

* Components  
* Hooks  
* Utilities  
* Services  
* Providers  
* Contexts  
* Tests  
* Documentation

Examples:

* useCurrency.ts  
* currency-service.ts  
* transaction-engine.ts  
* auth-provider.tsx  
* platform-adapter.ts

Remove inconsistent naming patterns.  
**TASK 2 — STANDARDIZE FOLDER STRUCTURE**

Reorganize folders into a clear architecture.  
Target:  
src/  
application/  
domain/  
infrastructure/  
platform/  
presentation/  
shared/  
Move files only when it improves architecture.  
Preserve backward compatibility.  
Update all imports automatically.  
**TASK 3 — PLATFORM ORGANIZATION**

Separate platform-specific code from shared code.  
Examples:  
platform/  
web/  
mobile/  
desktop/  
pwa/  
No browser APIs inside shared domain logic.  
**TASK 4 — DOCUMENTATION RESTRUCTURE**

Split large documentation files into focused documents.  
Target:  
docs/  
architecture/  
frontend/  
backend/  
database/  
api/  
security/  
performance/  
platform/  
Android.md  
iOS.md  
Desktop.md  
PWA.md  
Responsive.md  
Offline.md  
testing/  
release/  
governance/  
contributing/  
Every document must have a single responsibility.  
**TASK 5 — REMOVE DEAD CODE**

Remove:

* Unused components  
* Unused utilities  
* Unused hooks  
* Unused styles  
* Unused assets  
* Unused icons  
* Unused configuration  
* Duplicate helper functions

Do not remove anything referenced by runtime or tests.  
**TASK 6 — REMOVE DUPLICATION**

Consolidate duplicated:

* Utility functions  
* Validation logic  
* Formatters  
* Currency helpers  
* Date helpers  
* API wrappers  
* Error handling

Create shared modules where appropriate.  
**TASK 7 — SECURITY TERMINOLOGY REVIEW**

Correct documentation that inaccurately claims security properties.  
Examples:  
Replace:  
"Base64 encryption"  
With:  
"Base64 encoding"  
Implement actual encryption only if the project already supports an appropriate mechanism.  
Do not misrepresent security.  
**TASK 8 — INDIA-FIRST STANDARDIZATION**

Ensure defaults are consistently India-first.  
Examples:

* INR  
* ₹ symbol  
* DD/MM/YYYY  
* Indian numbering system  
* Financial year (April–March)  
* UPI-first terminology

Do not hardcode values that should belong in the India configuration layer.  
**TASK 9 — IMPORT CLEANUP**

Remove:

* Circular imports  
* Duplicate exports  
* Unused imports  
* Broken aliases

Standardize module exports.  
**TASK 10 — TEST STRUCTURE**

Organize tests consistently.  
Examples:  
Component tests  
Feature tests  
Integration tests  
E2E tests  
Keep test naming consistent.  
**TASK 11 — VALIDATION**

Run:  
npm install  
npm run lint  
npm run typecheck  
npm test  
npm run test:e2e  
npm run build  
Do not mark this phase complete unless every command succeeds.  
**OUTPUT**

Provide:

1. Executive Summary  
2. Repository Reorganization Report  
3. Folder Structure Changes  
4. File Rename Report  
5. Import Update Report  
6. Dead Code Report  
7. Duplicate Code Report  
8. Documentation Reorganization Report  
9. Security Terminology Corrections  
10. India-First Standardization Report  
11. Files Created  
12. Files Modified  
13. Files Renamed  
14. Files Deleted  
15. Commands Executed  
16. Validation Report  
17. Rollback Instructions  
18. Suggested Git Branch  
19. Suggested Version Tag  
20. Recommendations for Phase 3

**QUALITY GATES**

The phase is NOT complete until:

* npm install passes  
* npm run lint passes  
* npm run typecheck passes  
* npm test passes  
* npm run test:e2e passes  
* npm run build passes

No TypeScript errors.  
No ESLint errors.  
No broken imports.  
No circular dependencies introduced.  
No business functionality changed.  
No breaking API changes.  
**FINAL RULE**

This phase is a repository modernization phase, not a feature phase.  
Every change must improve maintainability, readability, consistency, or architecture while preserving existing behavior.  
**Repository Modernization Program — Phase 3: Architecture Refactoring & Layer Enforcement**

You are an elite software architecture organization consisting of:

* Chief Technology Officer  
* VP Engineering  
* Distinguished Software Architect  
* Principal Domain Architect  
* Principal Platform Engineer  
* Principal Backend Engineer  
* Principal Frontend Engineer  
* Principal Mobile Engineer  
* Principal Database Engineer  
* Principal AI Engineer  
* Principal Security Engineer  
* Principal Performance Engineer  
* Principal QA Engineer  
* Principal Documentation Engineer

**PROJECT**

Smart Personal Finance Analyzer  
Architecture  
India-First Multi-Platform Experience Platform (MPEP)  
Repository Version  
v10.0.0  
This phase begins ONLY after:  
✓ Repository Audit  
✓ Repository Standardization  
have both completed successfully.  
**OBJECTIVE**

Refactor the project into a clean layered architecture.  
Do NOT redesign product features.  
Do NOT add new business functionality.  
Do NOT change the user experience.  
Only improve architecture.  
**TARGET ARCHITECTURE**

The repository must follow this dependency direction:  
Presentation  
↓  
Platform  
↓  
Application  
↓  
Domain  
↓  
Infrastructure  
Nothing may violate this rule.  
**PRESENTATION LAYER**

Contains ONLY:  
Pages  
Screens  
Components  
Layouts  
Navigation  
Forms  
Dialogs  
Charts  
Theme  
Localization  
Presentation layer must NEVER:  
Call Prisma  
Call database  
Contain financial calculations  
Contain business rules  
Contain payment logic  
Contain AI logic  
Contain workflow logic  
**PLATFORM LAYER**

Contains:  
Browser adapters  
Mobile adapters  
Desktop adapters  
PWA adapters  
Notifications  
Camera  
Clipboard  
Biometrics  
Storage  
Filesystem  
Share APIs  
Platform layer hides platform differences.  
Business logic must never directly call browser APIs.  
**APPLICATION LAYER**

Contains:  
Use Cases  
Commands  
Queries  
Services  
Orchestration  
Validation  
Permissions  
Workflow execution  
This layer coordinates the domain.  
**DOMAIN LAYER**

Contains ONLY:  
Financial calculations  
Budget engine  
Goals engine  
Currency engine  
Investment engine  
Tax calculations  
Insurance calculations  
Business entities  
Business rules  
Value objects  
Policies  
No React.  
No Next.js.  
No browser APIs.  
No Prisma.  
No fetch.  
**INFRASTRUCTURE LAYER**

Contains:  
Prisma  
Database  
REST  
External APIs  
Caching  
Queues  
Logging  
Telemetry  
Storage  
AI Providers  
Email  
SMS  
Payment providers  
Nothing outside this layer should know implementation details.  
**INDIA-FIRST DOMAIN**

Move all India-specific rules into dedicated modules.  
Examples:  
Indian Currency  
Indian Financial Year  
Indian Number Formatting  
Indian Banking  
Indian Tax Rules  
Indian Investments  
UPI  
Indian Holidays  
These should live inside configurable country modules.  
The rest of the domain must consume them through interfaces.  
**AI ARCHITECTURE**

Separate:  
Prompt Registry  
Provider Layer  
Safety Layer  
Evaluation Layer  
Conversation Layer  
Business logic must never directly call an LLM.  
**OFFLINE ARCHITECTURE**

Separate:  
Offline Queue  
Sync Engine  
Conflict Resolution  
Cache  
Storage  
Retry Engine  
Presentation should only observe state.  
**SECURITY**

Move:  
Authentication  
Authorization  
Permissions  
Encryption  
Session Management  
Audit Logging  
into dedicated modules.  
Presentation must not implement security logic.  
**DEPENDENCY VALIDATION**

Detect and remove:  
Circular dependencies  
Cross-layer violations  
Improper imports  
Duplicate abstractions  
Hidden dependencies  
**PACKAGE EXTRACTION (NO MONOREPO YET)**

Begin preparing shared packages logically.  
Examples:  
domain/  
application/  
platform/  
shared/  
Do NOT migrate to a monorepo in this phase.  
Only prepare clean module boundaries.  
**TESTING**

Verify:  
Unit Tests  
Integration Tests  
Architecture Tests  
Layer Boundary Tests  
Dependency Tests  
Regression Tests  
End-to-End Tests  
**DOCUMENTATION**

Update:  
Architecture Decision Records (ADRs)  
Layer diagrams  
Dependency diagrams  
Module responsibilities  
Platform diagrams  
India-first architecture documentation  
Developer onboarding guide  
**OUTPUT**

Provide:

1. Executive Summary  
2. Architecture Refactoring Report  
3. Layer Boundary Report  
4. Dependency Graph Summary  
5. Circular Dependency Report  
6. Cross-Layer Violation Report  
7. Domain Refactoring Report  
8. Platform Adapter Report  
9. Infrastructure Separation Report  
10. India-First Domain Report  
11. AI Architecture Report  
12. Security Architecture Report  
13. Files Created  
14. Files Modified  
15. Files Moved  
16. Files Deleted  
17. Documentation Updated  
18. Validation Report  
19. Rollback Instructions  
20. Recommendations for Phase 4

**QUALITY GATES**

Do not declare this phase complete until:

* npm install passes  
* npm run lint passes  
* npm run typecheck passes  
* npm test passes  
* npm run test:e2e passes  
* npm run build passes

Additionally:

* No Presentation → Infrastructure imports  
* No Presentation → Prisma imports  
* No Domain → React imports  
* No Domain → Next.js imports  
* No Domain → Browser API imports  
* No circular dependencies  
* No duplicated business logic

**FINAL RULE**

Architecture quality is more important than the number of files changed.  
Prefer moving responsibilities to the correct layer over introducing new abstractions.  
Every architectural change must make the project easier to understand, easier to test, and easier to extend for future platforms while preserving backward compatibility.  
**Repository Modernization Program — Phase 4: Quality, Security & Technical Debt Elimination**

You are an elite software engineering quality organization consisting of:

* Chief Technology Officer  
* Distinguished Software Architect  
* Principal QA Engineer  
* Principal Security Engineer  
* Principal Performance Engineer  
* Principal DevOps Engineer  
* Principal Accessibility Engineer  
* Principal Platform Engineer  
* Principal Backend Engineer  
* Principal Frontend Engineer  
* Principal AI Engineer  
* Principal Database Engineer  
* Principal Documentation Engineer

**PROJECT**

Smart Personal Finance Analyzer  
Architecture  
India-First Multi-Platform Experience Platform (MPEP)  
Repository Version  
v10.0.0  
Previous phases completed:  
✓ Repository Audit  
✓ Repository Standardization  
✓ Architecture Layer Enforcement  
**OBJECTIVE**

Stabilize the repository after the architecture refactor.  
This phase is **NOT** a feature phase.  
Do **NOT** add user-facing functionality.  
The goal is to make the codebase production-grade by removing technical debt, correcting inaccurate implementation claims, improving security, strengthening tests, and validating architectural integrity.  
**TASK 1 — TECHNICAL DEBT AUDIT**

Identify and resolve:

* TODOs  
* FIXMEs  
* Dead code  
* Duplicate utilities  
* Duplicate business rules  
* Duplicate validation logic  
* Oversized files  
* Oversized components  
* Oversized hooks  
* Oversized services

Refactor where appropriate.  
**TASK 2 — SECURITY CORRECTIONS**

Verify every security claim against the implementation.  
Examples:  
Base64 is NOT encryption.  
If documentation or code incorrectly represents Base64 encoding as encryption:

* Correct the documentation.  
* Replace the implementation with an appropriate mechanism only if the project already supports secure encryption.  
* Otherwise clearly document that encoding is not a security feature.

Validate:

* Authentication  
* Authorization  
* Session handling  
* Secure storage  
* Secret management  
* CSP  
* XSS  
* CSRF  
* SSRF  
* SQL injection  
* Prompt injection  
* Audit logging

**TASK 3 — OFFLINE VALIDATION**

Verify the offline architecture.  
Ensure that:

* POST  
* PUT  
* PATCH  
* DELETE

are handled through the Offline Queue and Sync Engine rather than being cached directly by the Service Worker.  
Document retry behavior, conflict resolution, and failure handling.  
**TASK 4 — PWA VALIDATION**

Verify that the PWA includes and correctly configures:

* manifest.webmanifest  
* icons  
* start\_url  
* display  
* theme\_color  
* background\_color  
* scope  
* service worker registration  
* offline fallback

Report any missing items and implement them if required.  
**TASK 5 — PERFORMANCE VALIDATION**

Measure using actual build output.  
Report:

* First Load JS  
* Route sizes  
* Shared chunks  
* Largest bundles  
* Lazy-loaded routes

Do not invent performance numbers.  
Use the actual build artifacts.  
**TASK 6 — ACCESSIBILITY VALIDATION**

Validate against WCAG 2.2 AA.  
Check:

* Keyboard navigation  
* Focus order  
* Screen reader support  
* Color contrast  
* Touch target sizes  
* Semantic HTML  
* ARIA usage  
* Reduced motion support

Correct any issues found.  
**TASK 7 — INDIA-FIRST VALIDATION**

Verify every financial workflow uses India-first defaults.  
Examples:

* INR  
* ₹  
* DD/MM/YYYY  
* Indian numbering (lakh/crore)  
* Financial year (1 April–31 March)  
* UPI terminology  
* Indian banking  
* Indian investment terminology

Move any remaining hardcoded assumptions into the India configuration layer.  
**TASK 8 — DOCUMENTATION VALIDATION**

Compare documentation with implementation.  
Correct:

* inaccurate claims  
* outdated screenshots  
* outdated architecture diagrams  
* misleading wording  
* duplicated documentation

Every technical statement must be verifiable.  
**TASK 9 — TEST STRENGTHENING**

Improve:

* Unit tests  
* Integration tests  
* Architecture tests  
* Security tests  
* Accessibility tests  
* Performance regression tests  
* Offline tests  
* Platform adapter tests  
* India-first configuration tests

Increase coverage where practical.  
**TASK 10 — CODE QUALITY**

Enforce:

* SOLID  
* DRY  
* KISS  
* YAGNI  
* Strict TypeScript  
* No any unless justified  
* No dead exports  
* No unused imports  
* No circular dependencies

**TASK 11 — VALIDATION**

Run:

* npm install  
* npm run lint  
* npm run typecheck  
* npm test  
* npm run test:e2e  
* npm run build

Do not declare this phase complete unless every command succeeds.  
**OUTPUT**

Return:

1. Executive Summary  
2. Technical Debt Report  
3. Security Corrections  
4. Offline Architecture Validation  
5. PWA Validation  
6. Performance Report  
7. Accessibility Report  
8. India-First Compliance Report  
9. Documentation Corrections  
10. Test Coverage Improvements  
11. Files Created  
12. Files Modified  
13. Files Deleted  
14. Validation Report  
15. Rollback Instructions  
16. Suggested Git Branch  
17. Suggested Version Tag  
18. Recommendations for Phase 5

**QUALITY GATES**

This phase is complete only if:

* npm install passes  
* npm run lint passes  
* npm run typecheck passes  
* npm test passes  
* npm run test:e2e passes  
* npm run build passes

Additionally:

* No misleading security claims  
* No known critical technical debt  
* No unresolved architecture violations  
* No undocumented limitations  
* Documentation matches implementation

**FINAL RULE**

This phase exists to make the platform trustworthy.  
Do not optimize for adding code.  
Optimize for correctness, maintainability, security, documentation accuracy, and long-term stability.  
**Repository Modernization Program — Phase 5: Monorepo & Developer Platform Migration**

You are an elite software platform engineering organization consisting of:

* Chief Technology Officer  
* Distinguished Software Architect  
* Principal Platform Engineer  
* Principal Monorepo Engineer  
* Principal DevOps Engineer  
* Principal Backend Engineer  
* Principal Frontend Engineer  
* Principal Mobile Engineer  
* Principal AI Engineer  
* Principal QA Engineer  
* Principal Security Engineer  
* Principal Documentation Engineer

**PROJECT**

Smart Personal Finance Analyzer  
Architecture  
India-First Multi-Platform Experience Platform (MPEP)  
Repository Version  
v10.0.0  
Previous phases completed:  
✓ Repository Audit  
✓ Repository Standardization  
✓ Architecture Layer Enforcement  
✓ Technical Debt Elimination  
**OBJECTIVE**

Transform the repository into a professional monorepo suitable for long-term development and open-source collaboration.  
Do not introduce new user-facing features.  
Do not redesign business logic.  
Do not rewrite working code simply to fit the new structure.  
Preserve behavior while improving organization.  
**TARGET REPOSITORY**

finance-platform/  
apps/  
web/  
mobile/  
desktop/  
docs/  
packages/  
application/  
domain/  
platform/  
ui/  
design-system/  
currency/  
offline/  
sync/  
notifications/  
ai/  
auth/  
analytics/  
api-client/  
config/  
shared/  
testing/  
services/  
api/  
tooling/  
scripts/  
.github/  
docs/  
**TASK 1 — MIGRATE TO MONOREPO**

Move existing modules into logical packages.  
Maintain clean dependency boundaries.  
Do not duplicate code.  
**TASK 2 — PACKAGE EXTRACTION**

Extract reusable packages for:

* Domain logic  
* Application services  
* Shared UI  
* Design tokens  
* Authentication  
* Currency  
* Offline synchronization  
* Notifications  
* AI abstractions  
* Charts  
* Configuration  
* Testing utilities

Each package must have:

* Clear public API  
* Internal modules hidden  
* Independent tests  
* Independent documentation

**TASK 3 — APPLICATIONS**

Organize applications:  
apps/web  
Current Next.js application.  
apps/mobile  
Future mobile application scaffold.  
apps/desktop  
Future desktop application scaffold.  
apps/docs  
Documentation site.  
Do not implement native applications yet.  
Prepare their structure only.  
**TASK 4 — DESIGN SYSTEM**

Move reusable UI into:  
packages/ui  
Move design tokens into:  
packages/design-system  
Remove duplicated components.  
**TASK 5 — BUILD SYSTEM**

Adopt a monorepo build tool (for example, Turborepo or Nx) only if the migration is justified by the repository size and workflow. Document the trade-offs of the chosen approach.  
Configure:

* Incremental builds  
* Task caching  
* Shared TypeScript configuration  
* Shared lint configuration  
* Shared testing configuration

**TASK 6 — DEVELOPER EXPERIENCE**

Improve:

* Local development  
* Dependency management  
* Code generation  
* Shared scripts  
* Project templates  
* Onboarding

**TASK 7 — CI/CD**

Standardize:

* Pull request validation  
* Build matrix  
* Test matrix  
* Lint  
* Type checking  
* Security scanning  
* Dependency auditing  
* Release automation

**TASK 8 — OPEN SOURCE PREPARATION**

Add or improve:

* CONTRIBUTING.md  
* CODE\_OF\_CONDUCT.md  
* SECURITY.md  
* GOVERNANCE.md  
* SUPPORT.md  
* Issue templates  
* Pull request templates  
* Repository labels  
* Maintainer guide

**TASK 9 — DOCUMENTATION**

Document:

* Monorepo architecture  
* Package responsibilities  
* Dependency graph  
* Build process  
* Release process  
* Developer workflow

**TASK 10 — VALIDATION**

Run:

* npm install  
* npm run lint  
* npm run typecheck  
* npm test  
* npm run test:e2e  
* npm run build

Verify that package boundaries have not introduced regressions.  
**OUTPUT**

Provide:

1. Executive Summary  
2. Monorepo Migration Report  
3. Repository Structure Changes  
4. Package Extraction Report  
5. Build System Changes  
6. Developer Experience Improvements  
7. CI/CD Improvements  
8. Open Source Readiness Report  
9. Documentation Updates  
10. Files Created  
11. Files Moved  
12. Files Modified  
13. Validation Report  
14. Rollback Instructions  
15. Suggested Git Branch  
16. Suggested Version Tag  
17. Recommendations for Phase 6

**QUALITY GATES**

Do not declare the migration complete unless:

* All builds succeed.  
* All tests succeed.  
* No package has circular dependencies.  
* Public APIs are documented.  
* Existing application behavior is preserved.  
* Developer setup is documented from a clean clone.

**FINAL RULE**

This phase is about improving the repository, not expanding the product.  
Optimize for maintainability, modularity, contributor experience, and long-term sustainability.  
**Repository Modernization Program — Phase 6: Platform Extraction & Shared SDK Architecture**

You are an elite platform engineering organization consisting of:

* Chief Technology Officer  
* Distinguished Software Architect  
* Principal Platform Engineer  
* Principal SDK Engineer  
* Principal Backend Engineer  
* Principal Frontend Engineer  
* Principal Mobile Engineer  
* Principal Desktop Engineer  
* Principal AI Engineer  
* Principal Security Engineer  
* Principal QA Engineer  
* Principal DevOps Engineer  
* Principal Documentation Engineer

**PROJECT**

Smart Personal Finance Analyzer  
Architecture  
India-First Multi-Platform Experience Platform (MPEP)  
Repository  
Monorepo  
Previous phases completed:  
✓ Repository Audit  
✓ Repository Standardization  
✓ Architecture Layer Enforcement  
✓ Technical Debt Elimination  
✓ Monorepo Migration  
**OBJECTIVE**

Extract reusable platform SDKs and shared modules so every client platform consumes the same business logic.  
Do not rewrite working business logic.  
Do not duplicate financial calculations.  
Create reusable interfaces.  
**TARGET ARCHITECTURE**

apps/  
web/  
mobile/  
desktop/  
packages/  
sdk/  
domain/  
application/  
ui/  
design-system/  
platform/  
api-client/  
offline/  
notifications/  
currency/  
ai/  
testing/  
**TASK 1 — SHARED SDK**

Create a reusable SDK exposing:  
Authentication  
Transactions  
Budgets  
Goals  
Investments  
Reports  
Notifications  
AI  
Offline Sync  
Currency  
Settings  
The SDK must be platform-neutral.  
**TASK 2 — PLATFORM ADAPTERS**

Implement adapters for:  
Web  
Android  
iOS  
Desktop  
PWA  
Adapters must isolate platform-specific APIs.  
No business logic inside adapters.  
**TASK 3 — API CLIENT**

Extract a shared API client.  
Provide:  
Typed requests  
Typed responses  
Error handling  
Retry logic  
Authentication handling  
Request cancellation  
Offline awareness  
**TASK 4 — CONFIGURATION**

Extract shared configuration.  
Support:  
Environment configuration  
Country configuration  
India Pack  
Feature flags  
Theme configuration  
Localization  
**TASK 5 — INDIA PACK**

Formalize the India configuration package.  
Include:  
INR  
Indian number formatting  
Financial year  
UPI defaults  
Indian banking conventions  
Investment terminology  
Tax terminology  
Date formatting  
The architecture must support future country packs without changing the SDK.  
**TASK 6 — DESIGN TOKENS**

Move:  
Colors  
Typography  
Spacing  
Elevation  
Motion  
Icons  
Breakpoints  
into reusable design tokens consumed by all applications.  
**TASK 7 — PLATFORM TESTING**

Validate every platform adapter independently.  
Create:  
Adapter tests  
SDK tests  
API client tests  
Configuration tests  
Offline tests  
**TASK 8 — DOCUMENTATION**

Create:  
SDK Guide  
Platform Adapter Guide  
Configuration Guide  
Country Pack Guide  
India Pack Guide  
API Client Guide  
Architecture diagrams  
**TASK 9 — OPEN SOURCE READINESS**

Document:  
Public APIs  
Extension points  
Versioning strategy  
Deprecation policy  
Contribution guidelines for SDK packages  
**TASK 10 — VALIDATION**

Run:

* npm install  
* npm run lint  
* npm run typecheck  
* npm test  
* npm run test:e2e  
* npm run build

Ensure all packages and applications build successfully.  
**OUTPUT**

Provide:

1. Executive Summary  
2. SDK Extraction Report  
3. Platform Adapter Report  
4. API Client Report  
5. India Pack Report  
6. Configuration Report  
7. Design Token Report  
8. Documentation Updates  
9. Files Created  
10. Files Modified  
11. Validation Report  
12. Rollback Instructions  
13. Suggested Git Branch  
14. Suggested Version Tag  
15. Recommendations for Phase 7

**QUALITY GATES**

This phase is complete only if:

* Shared SDK is platform-independent.  
* Platform adapters contain no business logic.  
* India Pack is the default configuration.  
* API client is shared across applications.  
* Existing web functionality is preserved.  
* All builds, tests, linting, and type checks pass.

**FINAL RULE**

The goal is not to create more applications.  
The goal is to create a reusable platform foundation so that future web, Android, iOS, desktop, and other clients can all consume the same SDK, domain logic, and India-first configuration with minimal duplication.  
**Repository Modernization Program — Phase 7: Developer Ecosystem & Open Source Platform**

You are an elite open-source engineering organization consisting of:

* Chief Technology Officer  
* Distinguished Software Architect  
* Principal Platform Engineer  
* Principal Developer Experience Engineer  
* Principal Documentation Engineer  
* Principal API Engineer  
* Principal Security Engineer  
* Principal DevOps Engineer  
* Principal QA Engineer  
* Principal Community Engineer  
* Principal Open Source Program Manager

**PROJECT**

Smart Personal Finance Analyzer  
Architecture  
India-First Multi-Platform Experience Platform (MPEP)  
Repository  
Monorepo  
Current Release  
v10.x  
**OBJECTIVE**

Transform the project into a professional open-source platform that external developers can understand, build, extend, and contribute to.  
Do not add new end-user features.  
Focus on contributor experience, governance, extension points, and long-term maintainability.  
**TASK 1 — DEVELOPER PORTAL**

Create a complete developer portal.  
Include:  
Getting Started  
Architecture Overview  
Repository Tour  
Installation Guide  
Development Workflow  
Coding Standards  
Testing Guide  
Release Process  
Versioning  
Migration Guides  
Extension Development  
Troubleshooting  
Frequently Asked Questions  
**TASK 2 — PUBLIC SDK DOCUMENTATION**

Document every public package.  
Include:  
Purpose  
Responsibilities  
Public APIs  
Examples  
Versioning  
Deprecation Policy  
Breaking Change Policy  
Error Handling  
Thread Safety (where applicable)  
**TASK 3 — EXTENSION FRAMEWORK**

Formalize extension points.  
Allow future developers to extend:  
Reports  
Charts  
AI Providers  
Notification Providers  
Authentication Providers  
Storage Providers  
Offline Providers  
Country Packs  
Import/Export Formats  
Analytics  
No core code modifications should be required for supported extensions.  
**TASK 4 — COUNTRY PACK FRAMEWORK**

Generalize localization into country packs.  
The repository ships only with:  
India Pack (enabled)  
Create architecture for future packs such as:  
United States  
United Kingdom  
Canada  
Australia  
Germany  
Singapore  
Japan  
Do not implement them.  
Only define interfaces.  
**TASK 5 — PUBLIC API STABILITY**

Define:  
Semantic Versioning  
Public API contracts  
Internal APIs  
Experimental APIs  
Deprecated APIs  
Support windows  
Long-Term Support policy  
**TASK 6 — CONTRIBUTOR EXPERIENCE**

Improve:  
Repository onboarding  
Development environment  
One-command setup  
Code generation  
Local testing  
Local documentation  
Sample data  
Example extensions  
**TASK 7 — COMMUNITY GOVERNANCE**

Create or improve:  
CONTRIBUTING.md  
CODE\_OF\_CONDUCT.md  
SECURITY.md  
GOVERNANCE.md  
MAINTAINERS.md  
ROADMAP.md  
SUPPORT.md  
Issue templates  
Pull request templates  
Bug report templates  
Feature request templates  
RFC template  
Architecture Decision Record template  
**TASK 8 — AUTOMATION**

Automate:  
Formatting  
Linting  
Testing  
Security scanning  
Dependency updates  
Release notes  
Changelog generation  
Documentation validation  
Link checking  
License validation  
**TASK 9 — INDIA-FIRST PLATFORM**

Ensure the India Pack includes:  
Currency  
Banking  
UPI  
Financial Year  
Tax terminology  
Investment terminology  
Insurance terminology  
Indian number formatting  
Indian date formatting  
Localization  
No Indian-specific rules should leak into the generic platform.  
**TASK 10 — DOCUMENTATION SITE**

Create a documentation site that includes:  
User Documentation  
Developer Documentation  
Architecture  
SDK Reference  
API Reference  
Country Pack Guide  
Platform Guide  
Offline Guide  
Security Guide  
Release Notes  
Search functionality  
**TASK 11 — QUALITY VALIDATION**

Run:

* npm install  
* npm run lint  
* npm run typecheck  
* npm test  
* npm run test:e2e  
* npm run build

Validate that:  
Public APIs are documented.  
Examples compile.  
Links work.  
Developer onboarding succeeds from a clean clone.  
**OUTPUT**

Provide:

1. Executive Summary  
2. Developer Experience Report  
3. SDK Documentation Report  
4. Extension Framework Report  
5. Country Pack Framework Report  
6. Governance Report  
7. Automation Report  
8. Documentation Site Report  
9. Files Created  
10. Files Modified  
11. Validation Report  
12. Rollback Instructions  
13. Suggested Git Branch  
14. Suggested Version Tag  
15. Recommendations for Phase 8

**QUALITY GATES**

Do not complete this phase unless:

* All quality gates pass.  
* Documentation builds successfully.  
* A new developer can set up the project from scratch using only the published documentation.  
* Extension points are documented.  
* India Pack remains the default configuration.  
* Existing application behavior is unchanged.

**FINAL RULE**

This phase transforms the project from "software" into a "platform."  
Optimize for maintainability, openness, discoverability, and contributor experience.  
The success criterion is that an external developer can understand, build, and extend the platform without needing undocumented knowledge.  
**Repository Modernization Program — Phase 8: Production Readiness & Community Launch**

You are an elite software release organization consisting of:

* Chief Technology Officer  
* VP Engineering  
* Distinguished Software Architect  
* Principal Site Reliability Engineer  
* Principal DevOps Engineer  
* Principal Security Engineer  
* Principal QA Engineer  
* Principal Documentation Engineer  
* Principal Developer Experience Engineer  
* Principal Community Manager  
* Principal Open Source Program Manager

**PROJECT**

Smart Personal Finance Analyzer  
Architecture  
India-First Multi-Platform Experience Platform (MPEP)  
Repository  
Open-Source Monorepo (if adopted)  
Current Version  
v10.x  
**OBJECTIVE**

Prepare the project for its first public production release and open-source launch.  
Do not add major product features.  
Focus on reliability, polish, release engineering, documentation, and community readiness.  
**TASK 1 — RELEASE READINESS REVIEW**

Perform a complete production readiness review covering:

* Architecture  
* Performance  
* Security  
* Accessibility  
* Documentation  
* Testing  
* CI/CD  
* Dependency health  
* License compliance

List all remaining blockers.  
**TASK 2 — SECURITY REVIEW**

Run a comprehensive security review.  
Verify:

* Secret handling  
* Dependency vulnerabilities  
* Authentication  
* Authorization  
* Session management  
* Secure storage  
* CSP  
* XSS  
* CSRF  
* SSRF  
* SQL injection  
* Prompt injection  
* Sensitive data handling

Document findings and remediation.  
**TASK 3 — RELEASE ARTIFACTS**

Prepare:

* CHANGELOG  
* Release Notes  
* Upgrade Guide  
* Migration Guide  
* Known Limitations  
* Support Matrix  
* Compatibility Matrix

**TASK 4 — DOCUMENTATION QA**

Verify:

* Every link works.  
* Code examples compile.  
* Installation steps work from a clean machine.  
* Screenshots are current.  
* API documentation matches implementation.

**TASK 5 — COMMUNITY LAUNCH**

Prepare:

* GitHub repository description.  
* README.  
* CONTRIBUTING.  
* CODE\_OF\_CONDUCT.  
* SECURITY.  
* GOVERNANCE.  
* Issue templates.  
* Pull request templates.  
* Discussion guidelines.

**TASK 6 — INDIA-FIRST VALIDATION**

Confirm that the default configuration reflects India:

* INR  
* Indian numbering  
* Indian financial year  
* UPI-first terminology  
* Indian investment terminology  
* Indian tax terminology

Verify that these defaults are configurable through the country-pack mechanism.  
**TASK 7 — OBSERVABILITY REVIEW**

Verify:

* Logging  
* Metrics  
* Health checks  
* Error reporting  
* Backup procedures  
* Disaster recovery documentation

**TASK 8 — PERFORMANCE REVIEW**

Use actual measurements to review:

* Build size  
* Route sizes  
* Bundle analysis  
* Startup performance  
* Largest dependencies

Document optimization opportunities.  
**TASK 9 — RELEASE PROCESS**

Define and document:

* Stable releases  
* Beta releases  
* Release candidates  
* Hotfix process  
* LTS policy  
* Version support policy

**TASK 10 — FINAL VALIDATION**

Run:

* npm install  
* npm run lint  
* npm run typecheck  
* npm test  
* npm run test:e2e  
* npm run build

Verify the project from a fresh clone.  
**OUTPUT**

Provide:

1. Executive Summary  
2. Production Readiness Report  
3. Security Review  
4. Documentation QA Report  
5. Community Launch Checklist  
6. India-First Compliance Review  
7. Observability Review  
8. Performance Review  
9. Release Artifacts  
10. Validation Report  
11. Remaining Risks  
12. Recommended First Public Release Version  
13. Rollback Plan  
14. Long-Term Maintenance Recommendations

**QUALITY GATES**

Do not recommend public release unless:

* All required quality gates pass.  
* Documentation is complete and verified.  
* A clean-clone setup succeeds.  
* Security review identifies no unresolved critical issues.  
* Known limitations are documented honestly.  
* India Pack is the default active configuration.  
* Public release artifacts are complete.

**FINAL RULE**

Do not optimize for adding more code.  
Optimize for shipping a trustworthy, maintainable, well-documented platform that users and contributors can rely on from day one.

