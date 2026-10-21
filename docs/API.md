# VentureOS | REST API Specification

This document provides the complete, authoritative REST API specification for **VentureOS**. All routes are mounted under the `/api` path prefix.

---

## 1. Global Conventions & Standards

### Standard Response Envelope
All successful API responses return a structured JSON envelope:
```json
{
  "success": true,
  "message": "Optional human-readable confirmation message",
  "data": { ... }
}
```

### Standard Error Envelope
All error responses (4xx, 5xx) adhere to this format:
```json
{
  "success": false,
  "error": "Descriptive error message explaining the cause of failure"
}
```

### Required Headers
| Header | Description | Required? |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <JWT_TOKEN>` issued upon login or registration | Required on protected routes |
| `x-workspace-id` | Active Workspace ID (enforces tenant scoping) | Required on all tenant-specific routes |
| `Content-Type` | `application/json` (or `multipart/form-data` for file uploads) | Required |

---

## 2. Authentication & User Management (`/api/auth`)

### `POST /api/auth/register`
Registers a new user, automatically creates an initial company workspace, and assigns the user as `Owner`.
- **RBAC**: Public (No auth required)
- **Request Body**:
  ```json
  {
    "name": "Jane Founder",
    "email": "jane@startup.io",
    "password": "Password123!",
    "companyName": "Acme Dynamics",
    "industry": "SaaS"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": { "id": "...", "name": "Jane Founder", "email": "jane@startup.io" },
      "workspaces": [{ "id": "...", "name": "Acme Dynamics", "role": "Owner" }],
      "activeWorkspace": { "id": "...", "name": "Acme Dynamics", "role": "Owner" }
    }
  }
  ```

### `POST /api/auth/login`
Authenticates existing users and returns accessible workspaces with assigned roles.
- **RBAC**: Public
- **Request Body**: `{ "email": "alex@ventureos.io", "password": "password123" }`
- **Response (`200 OK`)**: Returns JWT token, user profile, and workspace memberships.

### `GET /api/auth/me`
Returns the authenticated session profile and workspace list.
- **RBAC**: Authenticated (`authenticate`)
- **Response (`200 OK`)**: User profile, preferences, and workspaces.

### `PUT /api/auth/profile`
Updates user profile settings (name, avatar, notification preferences).
- **RBAC**: Authenticated

---

## 3. Workspace Management (`/api/workspaces`)

### `POST /api/workspaces`
Creates an additional isolated workspace for the user.
- **RBAC**: Authenticated

### `GET /api/workspaces/details`
Returns company profile and metadata for the active workspace.
- **RBAC**: Authenticated + `resolveWorkspace`

### `PUT /api/workspaces/profile`
Updates company metadata (name, website, industry, description).
- **RBAC**: `requireRole('Admin')`

### `GET /api/workspaces/members`
Lists all active and invited team members with their RBAC roles.
- **RBAC**: Authenticated + `resolveWorkspace`

### `POST /api/workspaces/members/invite`
Invites a team member by email with an initial role.
- **RBAC**: `requireRole('Admin')`
- **Request Body**: `{ "email": "engineer@startup.io", "role": "Employee" }`

### `PUT /api/workspaces/members/:id/role`
Updates an existing member's RBAC role.
- **RBAC**: `requireRole('Owner')`

---

## 4. CRM & Sales Pipeline (`/api/leads`)

### `GET /api/leads`
Lists sales pipeline opportunities for the workspace.
- **Query Params**: `status` (`New`, `Contacted`, `Qualified`, `Proposal`, `Negotiation`, `Won`, `Lost`), `search`
- **RBAC**: Authenticated

### `POST /api/leads`
Creates a new lead opportunity.
- **RBAC**: `requireRole('Employee')`
- **Request Body**:
  ```json
  {
    "name": "Jonathan Reynolds",
    "company": "Vanguard Aerospace",
    "email": "jonathan@vanguardaero.com",
    "dealValue": 55000,
    "industry": "Aerospace",
    "source": "Outbound Demo"
  }
  ```

### `GET /api/leads/:id`
Returns lead details, timeline, and logged interactions.
- **RBAC**: Authenticated

### `PUT /api/leads/:id`
Updates lead details or moves lead through pipeline stages.
- **RBAC**: `requireRole('Employee')`

### `POST /api/leads/:id/score`
Invokes the AI Lead Scoring Engine.
- **RBAC**: `requireRole('Employee')`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "score": 85,
      "risk": "low",
      "reasons": ["High deal value matches ICP", "Frequent engagement"],
      "recommendedAction": "Schedule executive technical demo"
    }
  }
  ```

### `POST /api/leads/:id/sales-assistant`
Generates a tailored sales strategy: customized email pitch draft, discovery questions, and objection handling scripts.
- **RBAC**: `requireRole('Employee')`

### `POST /api/leads/:id/convert-to-customer`
Converts a `Won` lead into an active `Customer` account, copying deal value into customer lifetime value.
- **RBAC**: `requireRole('Manager')`

---

## 5. Customer Intelligence (`/api/customers`)

### `GET /api/customers`
Lists customer accounts.
- **Query Params**: `status` (`active`, `churn_risk`, `churned`), `search`
- **RBAC**: Authenticated

### `POST /api/customers`
Manually registers a customer profile.
- **RBAC**: `requireRole('Manager')`

### `GET /api/customers/:id`
Returns Customer 360 profile, feedback items, and health score breakdown.
- **RBAC**: Authenticated

### `POST /api/customers/:id/assess-health`
Runs an AI churn risk diagnosis on the account.
- **RBAC**: `requireRole('Employee')`

---

## 6. Projects & Task Execution (`/api/projects`)

### `GET /api/projects`
Lists all active workspace projects with progress percentages and budgets.
- **RBAC**: Authenticated

### `POST /api/projects`
Creates a new project manually.
- **RBAC**: `requireRole('Manager')`

### `GET /api/projects/tasks`
Lists workspace tasks.
- **Query Params**: `status` (`todo`, `in_progress`, `review`, `done`), `projectId`, `priority`
- **RBAC**: Authenticated

### `POST /api/projects/tasks`
Creates an individual task.
- **RBAC**: `requireRole('Employee')`

### `PUT /api/projects/tasks/:id`
Updates a task's status, priority, or assignee.
- **RBAC**: `requireRole('Employee')`

### `POST /api/projects/ai-planner`
The AI Project Planner generation endpoint. Gathers workspace context, active team members, and workload, and returns a structured proposed plan.
- **RBAC**: `requireRole('Manager')`
- **Request Body**:
  ```json
  {
    "goal": "Build multi-tenant SOC2 compliant data warehouse ingestion pipeline",
    "scope": "Core ETL service, BigQuery sync, RBAC audit logs",
    "budget": 45000,
    "timeframe": "6 weeks",
    "constraints": "Zero-downtime database migration"
  }
  ```
- **Response (`200 OK`)**: Returns full structured plan with milestones, tasks, deliverables, and risks.

### `POST /api/projects/ai-planner/approve`
Instantiates an approved plan into actual `Project` and `Task` documents in MongoDB.
- **RBAC**: `requireRole('Manager')`
- **Response (`201 Created`)**: Returns created project, created task array, and notification.

---

## 7. Document RAG Knowledge Base (`/api/documents`)

### `GET /api/documents`
Lists uploaded files and processing statuses.
- **RBAC**: Authenticated

### `POST /api/documents/upload`
Multipart form upload for `.pdf`, `.docx`, `.csv`, `.txt` (max 15MB). Automatically extracts text, generates sliding-window chunks, and stores vector embeddings.
- **RBAC**: `requireRole('Manager')`

### `POST /api/documents/rag/ask`
Queries the workspace document knowledge base. Performs cosine vector similarity search against tenant chunks and generates a grounded answer with citations.
- **RBAC**: Authenticated
- **Request Body**: `{ "question": "What are our SLA response times?" }`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "answer": "According to the Service Level Agreement, Tier 1 issues require a 1-hour response...",
      "citations": [
        {
          "documentTitle": "Master SLA 2026.pdf",
          "section": "Section 3",
          "snippet": "Tier 1 critical severity incidents require initial response within 60 minutes...",
          "similarityScore": 0.8624
        }
      ],
      "confidence": 0.8624
    }
  }
  ```

### `DELETE /api/documents/:id`
Deletes document and cascades deletion to all associated `DocumentChunk` records.
- **RBAC**: `requireRole('Manager')`

---

## 8. AI Business Copilot (`/api/ai/copilot` & `/api/copilot`)

### `POST /api/ai/copilot/chat`
Multi-turn conversational assistant with authorized tool execution against MongoDB.
- **RBAC**: Authenticated
- **Request Body**:
  ```json
  {
    "message": "Why did revenue fall compared to last month?",
    "conversationId": "6ad8f8cf62025addb1c912c6"
  }
  ```
- **Response (`200 OK`)**: Returns synthesized natural-language answer, `conversationId`, `turnCount`, and array of `toolsUsed`.

### `GET /api/ai/copilot/conversation/:id`
Retrieves past conversation history for thread restoration.
- **RBAC**: Authenticated (Triple-guarded: `_id`, `workspaceId`, `userId`)

### `POST /api/ai/copilot/approve-action`
Executes an Action Proposal created by the Copilot tool loop (e.g. creating a task).
- **RBAC**: `requireRole('Employee')`

---

## 9. Financial Intelligence & Forecasting (`/api/finance`)

### `GET /api/finance`
Returns transaction ledger records (revenue and expenses).
- **RBAC**: Authenticated

### `POST /api/finance`
Logs a financial record (amount, category, recurring flag, date).
- **RBAC**: `requireRole('Manager')`

### `GET /api/finance/summary`
Computes deterministic financial metrics (MRR, ARR, CAC, LTV, net margin, burn rate, runway).
- **RBAC**: Authenticated

### `GET /api/finance/forecast`
Computes 30/60/90-day predictive cashflow forecast using OLS linear regression with qualitative AI financial commentary.
- **RBAC**: Authenticated

---

## 10. Executive Dashboard & Health (`/api/dashboard`)

### `GET /api/dashboard`
Aggregates live multi-departmental intelligence:
- Deterministic KPIs (MRR, active deals, pipeline value, customer count, task completion ratio)
- 5-Dimension Business Health Index score and qualitative AI commentary
- Cross-module heuristic risk alerts
- Revenue and expense trend charts

---

## 11. Meeting Intelligence (`/api/meetings`)
- `GET /api/meetings`: Lists meeting summaries and action items.
- `POST /api/meetings/analyze`: Analyzes transcripts, extracting decisions, requirements, and action items.
- `POST /api/meetings/:id/action-items/:itemId/approve`: Converts an action item into a real workspace task.

---

## 12. Marketing Studio (`/api/marketing`)
- `GET /api/marketing`: Lists campaigns with ROI, CTR, and CAC attribution metrics.
- `POST /api/marketing`: Creates a campaign.
- `POST /api/marketing/:id/ai-content`: Generates multi-channel marketing assets (social posts, emails, ad copy).
- `POST /api/marketing/:id/metrics`: Records impressions, clicks, conversions, and spend.

---

## 13. Competitor Intelligence (`/api/competitors`)
- `GET /api/competitors`: Lists competitor profiles and feature matrices.
- `POST /api/competitors`: Adds a competitor.
- `POST /api/competitors/:id/analyze`: Generates AI SWOT analysis and whitespace recommendations.

---

## 14. Customer Feedback (`/api/feedback`)
- `GET /api/feedback`: Lists customer feedback with sentiment and urgency scoring.
- `POST /api/feedback`: Logs feedback item.
- `POST /api/feedback/import-csv`: Batch imports feedback from CSV file.

---

## 15. Admin, Telemetry & Notifications
- `GET /api/admin/metrics`: System uptime and tenant counts.
- `GET /api/admin/ai-usage`: Token consumption and cost breakdown by model.
- `GET /api/admin/audit-logs`: Immutable workspace audit trail.
- `GET /api/admin/automations`: Event-driven automation rules.
- `POST /api/admin/automations/:id/toggle`: Enables/disables an automation.
- `GET /api/notifications`: Lists user alerts and notifications.
- `PUT /api/notifications/:id/read`: Marks notification as read.
- `GET /api/health`: Health check probe (`200 OK`).
