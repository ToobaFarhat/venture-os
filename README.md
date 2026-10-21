# VentureOS | Autonomous Business Intelligence & Operations Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Local%20%2F%20Atlas-47A248.svg)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> **Enterprise-grade, autonomous SaaS operating system designed for modern technology startups, scaleups, and cross-functional teams.** 

---

## 📚 Complete Platform Documentation Index

Comprehensive technical documentation is maintained under the [`docs/`](./docs/) directory:

| Document | Description | Direct Link |
| :--- | :--- | :--- |
| **System Architecture** | Full-stack C4 architectural design, data flow diagrams, sub-engines, and security boundary isolation. | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| **REST API Reference** | Complete endpoint catalog (50+ routes), request/response schemas, JWT auth, and `x-workspace-id` headers. | [docs/API.md](./docs/API.md) |
| **Database Design** | Detailed catalog of all 20 Mongoose schemas, relationships, multi-tenant index strategy, and aggregations. | [docs/DATABASE_DESIGN.md](./docs/DATABASE_DESIGN.md) |
| **AI Architecture** | Multi-provider orchestrator, tool-calling framework, prompt engineering, context injection, and telemetry. | [docs/AI_ARCHITECTURE.md](./docs/AI_ARCHITECTURE.md) |
| **RAG Knowledge Base** | Ingestion pipeline (PDF/DOCX/CSV/TXT), semantic chunking, embedding generation, and cosine QA. | [docs/RAG_ARCHITECTURE.md](./docs/RAG_ARCHITECTURE.md) |
| **Deployment Guide** | Production hosting on Render (Web Service + Static Site), MongoDB Atlas setup, environment configs, and smoke tests. | [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) |
| **Testing Guide** | Jest, Supertest, integration suites, E2E verification scripts, and CI/CD quality assurance procedures. | [docs/TESTING.md](./docs/TESTING.md) |
| **Security & Isolation** | Cryptographic tenant separation, RBAC permission matrix, rate limiting, and audit logging. | [docs/SECURITY.md](./docs/SECURITY.md) |
| **Environment Variables** | Exhaustive reference of all backend and frontend configuration options with security classifications. | [docs/ENVIRONMENT_VARIABLES.md](./docs/ENVIRONMENT_VARIABLES.md) |

---

## Executive Summary & Architecture Philosophy

VentureOS is **not** a collection of disjointed CRUD screens or a superficial UI mock. It is a unified, closed-loop business operating system where every transaction, deal, and project connects to live analytics, automated risk detection, and bounded AI assistance:

$$\text{Business Activity} \longrightarrow \text{MongoDB} \longrightarrow \text{Deterministic Analytics} \longrightarrow \text{AI Qualitative Layer} \longrightarrow \text{Human In The Loop} \longrightarrow \text{Database Action}$$

### Key Architectural Pillars:
1. **Strict Multi-Tenant Workspace Isolation**: Every MongoDB document is compound-indexed and scoped to a verified `workspaceId`. Active workspace membership and RBAC (`Owner`, `Admin`, `Manager`, `Employee`, `Viewer`) are cryptographically verified on every authenticated request via JWT and session middleware.
2. **Deterministic Financial & Health Separation**: Calculations for MRR, ARR, CAC, LTV, Burn Rate, Cash Runway, and the 5-Dimension Business Health Index are computed deterministically via exact mathematical formulas. The AI layer is reserved strictly for narrative synthesis, risk evaluation, and strategic advisory.
3. **Bounded AI Tool Calling & Human-in-the-Loop**: The global AI Copilot is equipped with bounded read-only analytical tools and generates structured **Action Proposals**. High-consequence mutations (creating projects, converting won deals, adding tasks) require explicit human review and confirmation before touching the database.
4. **Resilient AI Provider Abstraction**: Powered by a pluggable orchestrator supporting Google Gemini (`gemini-flash-lite-latest` / `gemini-2.5-flash`), OpenAI (`gpt-4o`), Anthropic, and a zero-dependency Mock Fallback engine that guarantees full platform testability and zero downtime. Complete token consumption and estimated dollar costs are tracked in the database.

---

## Core Platform Modules

| Module | Core Capabilities |
| :--- | :--- |
| **Executive Dashboard** | Real-time MRR, LTV, active deals, cross-module risk alerts, cashflow charts, and AI strategic advisory. |
| **5-Dimension Business Health** | Diagnostic indexing across Sales, Customer Health, Marketing, Finance, and Operations with empirical factor breakdowns. |
| **Cross-Module Risk Center** | Autonomous heuristic correlation linking deal stagnation, customer churn signals, cash burn acceleration, and delivery delays with 1-click mitigation tasks. |
| **CRM & Lead Pipeline** | Visual Kanban & List views, Deal stages, AI conversion propensity scoring (0-100), AI Sales Assistant (cold pitch drafts, discovery questions, objection handling), and 1-click Won conversion to Customer. |
| **Customer Intelligence (360°)** | Account directories, health scores, churn risk classification, support ticket logs, and customer sentiment analytics. |
| **Projects & Task Kanban** | Milestones, task stages (`todo`, `in_progress`, `review`, `done`), priorities, and an **AI Project Planner Wizard** with human approval workflows. |
| **Financial Forecasting (FP&A)** | General transaction ledger (revenue & expenses), MRR/burn rate accounting, and **30/60/90-Day Predictive Cashflow Forecasting** via OLS linear regression + AI financial commentary. |
| **Document RAG Knowledge Base** | Vector indexing for PDF, DOCX, CSV, TXT. Semantic search & question answering with grounded cosine similarity citations. |
| **Meeting Intelligence** | Transcript ingestion, automated extraction of executive summaries, confirmed decisions, requirements, and an **Action Item Converter** to project tasks. |
| **Marketing & Content Studio** | Campaign tracking, ROI/CAC/CTR attribution, and automated generation of multi-channel strategies, social posts, email sequences, and ad copy. |
| **Competitor Intelligence** | Rival profiles, feature parity matrices, AI SWOT & market gap analysis, and macro industry research. |
| **Customer Feedback** | Sentiment classification, urgency scoring, topic categorization, and CSV batch import. |
| **Automations & Rules Engine** | Event-driven trigger-action workflows (e.g. Won lead $\rightarrow$ onboarding project, Churn risk $\rightarrow$ account manager alert). |
| **Admin & AI Telemetry** | Token consumption metering, estimated dollar cost tracking by model, and immutable workspace audit logs. |
| **Workspace Settings** | Company profile customization, team member invitations, and granular RBAC role assignments. |

---

## The 10 End-to-End User Journeys 

1. **Journey 1: Tenant Onboarding**: User signs up, creates workspace, gets assigned `Owner`, and loads default configurations.
2. **Journey 2: Lead Acquisition to Customer**: Capture lead, score with AI, prepare pitch via AI Sales Assistant, move to Won, and convert to active Customer.
3. **Journey 3: Strategic Planning**: Enter high-level goal in AI Project Planner, inspect milestones & task backlog, approve proposal, and instantiate tasks.
4. **Journey 4: Document Knowledge Vectorization**: Upload PDF/DOCX contract, extract key terms, and query RAG engine with source citations.
5. **Journey 5: Meeting to Execution**: Paste raw transcript, extract decisions and action items, and approve items to create linked tasks.
6. **Journey 6: Financial Forecast & Runway**: Review ledger, run 30/60/90-day linear cashflow forecast, and examine AI burn commentary.
7. **Journey 7: Cross-Module Risk Mitigation**: Detect correlated risks across CRM, Finance, and Projects, and click "Convert to Mitigation Task".
8. **Journey 8: Marketing Campaign & Content**: Launch campaign, generate multi-channel assets with AI Content Studio, and record performance metrics.
9. **Journey 9: Competitor Whitespace**: Track competitors, generate AI SWOT analysis, and extract market whitespace opportunities.
10. **Journey 10: Global Copilot Inquiries**: Open floating drawer, execute queries against live MongoDB data via authorized tools, and approve proposed actions.

---

## Tech Stack & Directory Layout

```
Venture OS/
├── client/                     # Frontend SPA (React 18 + Vite + TS + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/             # AIInsightCard, ActionApprovalModal
│   │   │   ├── copilot/        # Floating CopilotDrawer with live tool execution
│   │   │   ├── layout/         # AppShell, Sidebar, Topbar, PublicNavbar/Footer
│   │   │   └── ui/             # Enterprise Button, Card, Badge, Modal, Input, etc.
│   │   ├── contexts/           # AuthContext, NotificationContext
│   │   ├── pages/              # All 15 Module & Auth Pages
│   │   ├── services/           # Axios API client with auth & workspace interceptors
│   │   └── types/              # Comprehensive TypeScript interfaces
│   └── package.json
│
├── server/                     # Backend API (Node.js + Express + TypeScript + Mongoose)
│   ├── src/
│   │   ├── ai/                 # Orchestrator, Gemini/OpenAI/Mock providers, Tool definitions
│   │   ├── analytics/          # Financial, Forecasting (OLS), Business Health, Risk & Automation engines
│   │   ├── config/             # Environment, Database, and Security configuration
│   │   ├── controllers/        # Route controllers across all 15 domains
│   │   ├── middleware/         # JWT Auth, Workspace isolation, RBAC, Error handling
│   │   ├── models/             # 20 Compound-indexed Mongoose schemas
│   │   ├── rag/                # Document text extractors, semantic chunking, cosine vector service
│   │   ├── routes/             # Express API routes (50+ endpoints)
│   │   ├── seed.ts             # Comprehensive realistic enterprise database seeder
│   │   └── app.ts              # Express application assembly
│   ├── tests/                  # Unit & Integration test suites (Jest + Supertest)
│   └── package.json
│
├── docs/                       # Complete Platform Technical Documentation
│   ├── ARCHITECTURE.md         # Full C4 architecture & subsystem flows
│   ├── API.md                  # Complete REST API route catalog
│   ├── DATABASE_DESIGN.md      # 20 Mongoose schemas & indexing strategies
│   ├── AI_ARCHITECTURE.md      # Copilot, tools, prompt orchestration & cost tracking
│   ├── RAG_ARCHITECTURE.md     # Document vectorization & grounded QA
│   ├── DEPLOYMENT.md           # Cloud deployment on Render & MongoDB Atlas
│   ├── TESTING.md              # Jest test suites & verification scripts
│   ├── SECURITY.md             # Security, RBAC & multi-tenant isolation
│   └── ENVIRONMENT_VARIABLES.md# Complete variable catalog & audit
│
├── .env.example                # Canonical root environment configuration template
└── README.md                   # Platform entry point and documentation hub
```

---

## Quickstart Guide

### Prerequisites
- **Node.js**: v18+ (tested on v20 and v24)
- **MongoDB**: v6+ running locally on `localhost:27017` or a MongoDB Atlas URI

---

### Step 1: Install Dependencies

From the repository root:
```bash
npm run install:all
# Or individually:
cd server && npm install
cd ../client && npm install
```

---

### Step 2: Configure Environment Variables

Create `.env` in `server/` (or use the root `.env.example` template):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ventureos
JWT_SECRET=super_secret_jwt_ventureos_key_change_in_production_98765
JWT_EXPIRES_IN=7d
AI_PROVIDER=gemini          # Options: "gemini" | "openai" | "anthropic" | "mock"
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-flash-lite-latest
CLIENT_URL=http://localhost:5173
```

---

### Step 3: Seed Database with Enterprise Demo Data

The seeder populates two isolated tenants, multiple team members, leads across every pipeline stage, active customers, projects, financial records, vector document chunks, meetings, and marketing campaigns:

```bash
cd server
npm run seed
```

#### Pre-seeded Demo Accounts:
| User | Role | Workspace | Email | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Morgan** | `Owner` (CEO) | **NovaPulse Analytics** | `alex@ventureos.io` | `password123` |
| **Sarah Chen** | `Manager` (Product Lead) | **NovaPulse Analytics** | `sarah@ventureos.io` | `password123` |
| **Marcus Vance** | `Owner` (Founder) | **Apex Cloud Systems** (Isolated) | `marcus@apexcloud.io` | `password123` |

*(Quick 1-Click Login buttons are available directly on the login screen for instant testing).*

---

### Step 4: Run Tests

Run the backend unit and integration test suites:
```bash
cd server
npm test
```
*Expected: 9/9 passing tests (Financial analytics, Auth & Workspace isolation, End-to-End User Journeys).*

---

### Step 5: Start the Development Servers

**Monorepo Commands (from root):**
```bash
npm run dev:server      # Starts Express API on http://localhost:5000
npm run dev:client      # Starts Vite React SPA on http://localhost:5173
```

Open your browser at **http://localhost:5173**.

---

## Security & Data Privacy

- **Strict Multi-Tenancy**: All database queries enforce `{ workspaceId: req.workspace.workspaceId }`. Cross-workspace data leakage is architecturally impossible.
- **RBAC Matrix**: Endpoints verify permission levels (`Owner`, `Admin`, `Manager`, `Employee`, `Viewer`) before processing write or sensitive read operations.
- **Auditing**: All mutations, approvals, and AI tool calls are recorded immutably in `AuditLog`.
- **JWT Protection**: Tokens are signed with HMAC SHA-256 and verified with expiration handling.

---

## License
MIT License. Built with pride for VentureOS.
