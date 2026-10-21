# VentureOS | Autonomous AI & LLM Architecture Specification

This document provides the complete architecture and implementation specification for all Artificial Intelligence, Large Language Model (LLM), and autonomous agent capabilities across **VentureOS**.

---

## 1. AI Provider Abstraction & Orchestrator

The AI architecture is centered around the `AIOrchestrator` singleton (`server/src/ai/ai.orchestrator.ts`), which provides a resilient interface across providers:

```mermaid
graph TD
    Caller[Controller / Service Call] --> AIOrch[AIOrchestrator Singleton]
    AIOrch --> ConfigCheck{AI_PROVIDER?}
    ConfigCheck -->|gemini| GeminiProv[GeminiAIProvider: @google/genai v2]
    ConfigCheck -->|openai| OpenAIProv[OpenAIProvider: openai SDK]
    ConfigCheck -->|mock| MockProv[MockAIProvider: Zero-Dependency Engine]
    GeminiProv -->|Primary Failure (503 / 429)| Fallback[Mock Fallback Engine]
    OpenAIProv -->|Primary Failure| Fallback
    AIOrch --> Telemetry[AIUsage Collection: Tokens, Latency & Estimated Cost]
```

### Active Production Models:
- **Google Gemini**: `gemini-flash-lite-latest` (configured via `GEMINI_MODEL`). Supports multimodal understanding, function calling, strict JSON output mode, and `text-embedding-004` vector embeddings.
- **OpenAI**: `gpt-4o` (configured via `OPENAI_API_KEY`).
- **Resilient Fallback**: Zero-dependency mock engine providing offline operation for unit tests and local development.

---

## 2. Authorized Tool Calling Registry (`ai.tools.ts`)

The Copilot possesses **12 bounded tools** declared with strict JSON schemas. Workspace context is derived **only** from authenticated session state (`req.workspace.workspaceId`) and is never trusted from LLM arguments:

| Tool Name | Type | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `getRevenueData` | Read | Authenticated | Retrieves gross revenue, expenses, recurring MRR, and net profit from MongoDB. |
| `getSalesPipeline` | Read | Authenticated | Aggregates CRM deals by stage (`New`, `Qualified`, `Won`, etc.) and calculates pipeline velocity. |
| `getLeads` | Read | Authenticated | Queries lead records with AI propensity scores and contact details. |
| `getCustomers` | Read | Authenticated | Lists client accounts with health scores, MRR, and churn risk levels. |
| `getCustomerDetails`| Read | Authenticated | Retrieves 360-degree profile, feedback history, and logged interactions for an account. |
| `getCustomerFeedback`| Read | Authenticated | Queries customer sentiment ratings, topic classifications, and urgency scores. |
| `getProjectStatus` | Read | Authenticated | Retrieves active projects, milestone progress percentages, and overdue tasks. |
| `getMarketingMetrics`| Read | Authenticated | Fetches marketing campaigns, spend, impressions, CTR, CAC, and attributed ROI. |
| `searchDocuments` | Read (RAG) | Authenticated | Executes cosine similarity search over workspace vector chunks in the RAG knowledge base. |
| `createTask` | Action Proposal | Human Approval | Emits an Action Proposal to create a project task. **Never touches DB without user approval.** |
| `createProject` | Action Proposal | Human Approval | Emits an Action Proposal to instantiate a project. Requires explicit user approval. |
| `createMarketingCampaign` | Action Proposal | Human Approval | Emits an Action Proposal to schedule a marketing campaign. Requires user approval. |

---

## 3. Multi-Turn Conversation Context Management

The Copilot controller (`server/src/controllers/copilot.controller.ts`) manages multi-turn history with memory-efficient compaction:

1. **Thread Persistence**: Conversations are saved to the `AIConversation` collection indexed by `{ workspaceId, userId, updatedAt }`.
2. **Smart History Compression**:
   - Conversations with $le 16$ messages are transmitted verbatim.
   - For long conversations ($> 16$ messages), the last 16 turns are sent verbatim, while older turns are transformed into a **Deterministic Topic Digest** prepended to the system prompt. This ensures indefinite conversation length without context window overflow or redundant LLM summarization costs.
3. **Pronoun & Entity Resolution**: Follow-up questions (e.g. *"Why was it lower?"*) resolve pronouns using the active thread's context and invoke fresh database tools when necessary.

---

## 4. Domain-Specific AI Intelligence Engines

### 1. AI Lead Scoring (`/api/leads/:id/score`)
- Evaluates deal size, industry match, and interaction frequency.
- Outputs a conversion propensity score ($0–100$), a risk rating (`low`, `medium`, `high`), key empirical reasons, and recommended sales actions.

### 2. AI Sales Assistant (`/api/leads/:id/sales-assistant`)
- Synthesizes personalized outbound cold pitches, technical discovery questions, and objection handling scripts tailored to the lead's company and industry.

### 3. Customer Churn Risk Diagnostic (`/api/customers/:id/assess-health`)
- Evaluates recent interaction sentiment, support ticket urgency, and payment regularity.
- Classifies churn risk into `low`, `medium`, or `high` with actionable retention playbooks.

### 4. Customer Feedback Sentiment Classifier (`/api/feedback`)
- Analyzes incoming text or CSV imports.
- Computes a continuous sentiment score ($-1.0$ to $+1.0$), classifies the topic (`product`, `pricing`, `support`, `onboarding`), and assigns an urgency level (`low`, `medium`, `high`).

### 5. AI Marketing & Content Studio (`/api/marketing/:id/ai-content`)
- Generates comprehensive go-to-market assets: multi-channel strategy, target buyer personas, social posts (LinkedIn/Twitter), automated email drip sequences, and high-converting ad copy.

### 6. AI Project Planner Wizard (`/api/projects/ai-planner`)
- Accepts strategic business goals, scope, budget, and timeframe constraints.
- Injects workspace context, available team members from `WorkspaceMember`, and existing workloads.
- Generates a structured JSON project proposal containing milestones, operational tasks, estimated hours, deliverables, success criteria, and risks.
- **Human-in-the-Loop**: The user reviews and edits the proposal in the UI before clicking **Approve & Instantiate Plan**, creating the actual `Project` and `Task` records in MongoDB.

### 7. Meeting Intelligence (`/api/meetings/analyze`)
- Analyzes raw meeting transcripts or notes.
- Extracts an executive summary, confirmed decisions, technical requirements, and structured action items with suggested assignees.
- Includes a 1-click **Action Item Converter** to instantiate items as project management tasks.

### 8. Financial Forecasting Commentary (`/api/finance/forecast`)
- Pairs with the OLS linear regression engine to explain 30/60/90-day cashflow runway projections and provide burn rate optimization commentary.

---

## 5. AI Usage & Cost Monitoring Telemetry

Every request through `AIOrchestrator.generate()` asynchronously records an immutable telemetry document in `AIUsage`:

```json
{
  "workspaceId": "6ad60a4fa69545aa9df4d637",
  "userId": "6ad60a4fa69545aa9df4d635",
  "module": "copilot",
  "model": "gemini-flash-lite-latest",
  "promptTokens": 1420,
  "completionTokens": 312,
  "totalTokens": 1732,
  "estimatedCost": 0.000824,
  "latencyMs": 1845,
  "status": "success"
}
```

Administrators can view real-time token volume, latency trends, and cumulative dollar spend broken down by module and model via `GET /api/admin/ai-usage`.
