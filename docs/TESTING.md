# VentureOS | Quality Assurance & Testing Specification

This document details the test suites, testing frameworks, execution procedures, and quality benchmarks for the **VentureOS** platform.

---

## 1. Testing Frameworks & Setup

| Component | Framework | Version | Configuration File | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Unit & Integration** | **Jest** | `^29.7.0` | `server/package.json` (`jest` block) | Unit calculations, API integration, and multi-tenant isolation |
| **HTTP Assertions** | **Supertest** | `^7.0.0` | In-memory Express app runner | Testing full request-to-response cycles without binding external ports |
| **TypeScript Testing** | **ts-jest** | `^29.2.5` | Integrated with Jest | Transpiles TypeScript test files on-the-fly |
| **Frontend Verification** | **Vite / TypeScript** | `5.7` / `6.1` | `client/vite.config.ts` | Compilation, type-checking, and production bundle validation |
| **E2E Scripts** | **Node.js Native** | `v20+` | `scratch/verify-*.js` | 10-Scenario Copilot verification and 11-Scenario AI Project Planner verification |

---

## 2. Test Suites Overview

The backend test suite is located in `server/tests/`:

```
server/tests/
├── unit/
│   └── financial.test.ts          # Deterministic FP&A mathematical calculations
└── integration/
    ├── auth_workspace.test.ts     # Multi-tenant isolation & RBAC verification
    └── journeys.test.ts           # End-to-End User Journeys (SRS Scenarios 2, 3, 10)
```

### Suite 1: Financial Analytics Unit Tests (`tests/unit/financial.test.ts`)
Validates that core business metrics are calculated with exact arithmetic precision rather than delegated to LLM hallucination:
- **Revenue, Expense & Profit Calculation**: Validates that gross revenue, total operational expenditures, and net income match transactional sums.
- **MRR & ARR Accounting**: Verifies that recurring revenue flags correctly compute Monthly Recurring Revenue and Annual Recurring Revenue (`MRR * 12`).
- **Deterministic CAC & LTV**: Verifies Customer Acquisition Cost (`Sales & Marketing Expenses / New Customers`) and Customer Lifetime Value computations.

### Suite 2: Multi-Tenant Workspace Isolation Tests (`tests/integration/auth_workspace.test.ts`)
Verifies cryptographic boundaries between organizations:
- **Tenant Onboarding**: Registers user, provisions initial workspace, sets role to `Owner`.
- **Unauthenticated Protection**: Rejects requests missing the `Authorization` header with `401 Unauthorized`.
- **Cross-Tenant Data Leakage Prevention**: Creates two independent tenants (Tenant Alpha and Tenant Beta). Verifies that User Beta cannot read, query, or infer confidential leads belonging to Tenant Alpha, returning `403 Forbidden` or empty results.

### Suite 3: End-to-End User Journeys Tests (`tests/integration/journeys.test.ts`)
Tests complete multi-module operational flows defined in the SRS:
- **Journey 2 (Sales Pipeline to Customer)**:
  1. Creates Lead Opportunity (`Vanguard Aerospace`, $55k).
  2. Scores Lead using AI propensity engine (validates score between 0 and 100).
  3. Converts Won lead to active `Customer` account with lifetime value.
- **Journey 3 (Customer Retention & Health)**:
  1. Simulates negative customer feedback.
  2. Verifies health score recalculation and churn risk flag.
- **Journey 10 (AI Copilot & Bounded Tool Calling)**:
  1. Sends query to Copilot.
  2. Verifies tool execution and Action Proposal generation.

---

## 3. How to Execute Tests

### Running the Full Test Suite
From the root of the repository:
```bash
npm test
```
Or inside the `server/` workspace:
```bash
cd server
npm test
```

### Running Tests in Watch Mode
```bash
cd server
npm run test:watch
```

### Expected Test Output
```text
PASS tests/integration/journeys.test.ts (12.308 s)
  VentureOS Core End-to-End User Journeys Tests
    √ Journey 2 (Sales Pipeline): Creates Lead -> Runs AI Lead Score -> Converts Won Lead to Customer
    √ Journey 3 (Customer Retention): Negative Feedback impacts Customer Health and triggers Churn Risk
    √ Journey 10 (AI Copilot): Queries sales pipeline tool and prepares controlled action proposal

PASS tests/integration/auth_workspace.test.ts
  Authentication & Multi-Tenant Workspace Isolation Integration Tests
    √ registers a new user and automatically establishes an active workspace
    √ rejects access to protected endpoints without authentication token
    √ strictly prevents cross-workspace tenant data access (Isolation Guarantee)

PASS tests/unit/financial.test.ts
  Financial Analytics Service (Deterministic Calculations)
    √ correctly computes total revenue, expenses, and net profit
    √ correctly calculates recurring MRR and ARR
    √ calculates CAC and LTV deterministically from customer data

Test Suites: 3 passed, 3 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        15.727 s
```

---

## 4. End-to-End Scenario Verification Scripts

In addition to Jest unit/integration tests, VentureOS includes dedicated live scenario verification scripts:

### Script 1: Copilot 10-Scenario Verification (`scratch/verify-copilot.js`)
Tests all 10 copilot requirements against the live server:
1. **General Knowledge**: "Explain MRR in simple language" (No tool called, textbook answer).
2. **Business Question**: "How is our business performing?" (Invokes `getRevenueData`).
3. **Data Analysis**: "Why did revenue fall compared with last month?" (Invokes financial analytics).
4. **Follow-Up Context**: "Why was it lower?" (Resolves pronoun "it" in the same conversation thread).
5. **Recommendation**: "What should we prioritize this week?" (Context-aware strategic advisory).
6. **Action Proposal**: "Create a follow-up task for the highest-priority lead" (Prepares action proposal).
7. **Missing Data Period**: "Revenue from January 2018" (Honest reporting without hallucination).
8. **Workspace Isolation**: Injects cross-workspace header (Blocked with HTTP 403).
9. **Provider Failure Simulation**: Tests graceful offline notice when LLM is unavailable.
10. **Empty Conversation**: Verifies prompt pills hide upon conversation start.

**Execution Command**:
```bash
node scratch/verify-copilot.js
# Result: 10/10 PASSED
```

### Script 2: AI Project Planner Verification (`scratch/verify-ai-planner.js`)
Tests the 11-step project planner lifecycle:
1. Authentication & token acquisition.
2. Empty form validation (400 Bad Request on empty goal).
3. Unauthorized request rejection (401 on invalid token).
4. Valid goal & scope submission with real Gemini model.
5. Structured JSON plan generation with milestones, tasks, and real assignees.
6. Plan review and in-memory editing (title, budget, priority).
7. Explicit approval via `POST /api/projects/ai-planner/approve`.
8. Verification of MongoDB Project and Task record creation.
9. Verification of records appearing in `GET /api/projects` and `GET /api/projects/tasks`.

**Execution Command**:
```bash
node scratch/verify-ai-planner.js
# Result: 100% PASSED
```

---

## 5. Type-Checking & Build Verification

Before committing code or deploying, run TypeScript compilation and production bundling:

```bash
# Backend TypeScript verification
cd server
npx tsc --noEmit
# Expected: Exit code 0, 0 errors

# Frontend TypeScript and bundle verification
cd ../client
npm run build
# Expected: ✓ 2300 modules transformed, built in ~5.0s, 0 errors
```
