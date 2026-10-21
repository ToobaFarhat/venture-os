# VentureOS | Environment Variables Specification

This document provides a comprehensive audit of all environment variables utilized across the **VentureOS** platform. Every variable listed here corresponds directly to configuration keys read by the backend server or frontend client code.

---

## 1. Quick Reference & Security Classification

| Variable Name | Service | Required? | Default in Code | Security Classification | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PORT` | Backend | Optional | `5000` | Public Config | HTTP port for Express API server |
| `NODE_ENV` | Backend | Optional | `development` | Public Config | Runtime environment (`development`, `production`, `test`) |
| `CLIENT_URL` | Backend | Required in Prod | `http://localhost:5173` | Public Config | Allowed CORS origin for frontend client requests |
| `MONGODB_URI` | Backend | **Required** | `mongodb://127.0.0.1:27017/ventureos` | **High Secret** | MongoDB connection string (Local or MongoDB Atlas) |
| `TEST_MONGODB_URI` | Backend (Tests) | Optional | `mongodb://127.0.0.1:27017/ventureos` | Sensitive | Dedicated MongoDB database URI for running test suites |
| `JWT_SECRET` | Backend | **Required** | Fallback dev secret | **Critical Secret** | Secret key used to sign and verify HMAC-SHA256 JWT tokens |
| `JWT_EXPIRES_IN` | Backend | Optional | `7d` | Public Config | Token validity duration (`7d`, `24h`, `30d`) |
| `AI_PROVIDER` | Backend | Optional | `mock` | Public Config | Active AI engine: `gemini`, `openai`, `anthropic`, or `mock` |
| `GEMINI_API_KEY` | Backend | Required if Gemini | Empty string | **High Secret** | Google Gemini API key from Google AI Studio |
| `GEMINI_MODEL` | Backend | Optional | `gemini-flash-lite-latest` | Public Config | Active Gemini model name |
| `OPENAI_API_KEY` | Backend | Required if OpenAI | Empty string | **High Secret** | OpenAI API key from OpenAI Platform |
| `ANTHROPIC_API_KEY`| Backend | Reserved | Empty string | **High Secret** | Anthropic Claude API key (reserved for future providers) |
| `UPLOAD_DIR` | Backend | Optional | `uploads` | Public Config | Local filesystem path for uploaded documents and assets |
| `MAX_FILE_SIZE_MB` | Backend | Optional | `15` | Public Config | Maximum file upload size limit in megabytes |
| `REDIS_URL` | Backend | Optional | None | Sensitive | Connection URI for Redis / BullMQ background workers |

---

## 2. Detailed Variable Specifications

### `PORT`
- **Description**: Defines the port number the Express.js server listens on.
- **Configured In**: `server/.env` or platform hosting settings (e.g. Render automatically sets `PORT`).
- **Example**: `PORT=5000`

### `NODE_ENV`
- **Description**: Specifies the operational environment. Affects error output verbosity, HTTP request logging (`morgan`), and test runner database selection.
- **Accepted Values**: `development`, `production`, `test`
- **Example**: `NODE_ENV=production`

### `CLIENT_URL`
- **Description**: The fully qualified URL of the React single-page application. Used by Express CORS middleware to permit browser API requests with credentials.
- **Local Example**: `CLIENT_URL=http://localhost:5173`
- **Production Example**: `CLIENT_URL=https://ventureos.onrender.com`

### `MONGODB_URI`
- **Description**: MongoDB connection URI. Supports standalone local installations, local replica sets, and MongoDB Atlas cloud clusters.
- **Security Requirement**: Must never be committed to git or exposed to client-side bundles.
- **Local Example**: `MONGODB_URI=mongodb://127.0.0.1:27017/ventureos`
- **Production Example**: `MONGODB_URI=mongodb+srv://ventureos_app:<PASSWORD>@cluster0.abcde.mongodb.net/ventureos?retryWrites=true&w=majority`

### `JWT_SECRET`
- **Description**: Symmetric encryption key used by `jsonwebtoken` to sign and verify user authentication tokens.
- **Security Requirement**: In production, generate a high-entropy cryptographically secure string (minimum 32 characters / 256 bits).
- **Generation Command**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Example**: `JWT_SECRET=4f7b2c9e1a8d5e0f3b6c9a2d1e4f7a8b5c2d9e0f3a6b1c4d7e2f5a8b1c4d7e0f`

### `JWT_EXPIRES_IN`
- **Description**: Duration before an issued JWT expires. Standard format parsed by the `ms` library.
- **Example**: `JWT_EXPIRES_IN=7d`

### `AI_PROVIDER`
- **Description**: Configures the primary AI provider loaded by `AIOrchestrator.getInstance()`.
- **Accepted Values**:
  - `gemini`: Uses the `@google/genai` v2 SDK with function calling, structured JSON output, and embedding generation.
  - `openai`: Uses the official `openai` SDK (`gpt-4o`).
  - `mock`: Uses the zero-dependency deterministic simulation engine. Perfect for offline development, local unit tests, and continuous integration.
- **Example**: `AI_PROVIDER=gemini`

### `GEMINI_API_KEY`
- **Description**: Google Gemini API key obtained from [Google AI Studio](https://aistudio.google.com/apikey).
- **Security Requirement**: High Secret. Never expose in frontend client code or commit to source control.
- **Example**: `GEMINI_API_KEY=AIzaSyA...`

### `GEMINI_MODEL`
- **Description**: Specific Gemini model name passed to `@google/genai`.
- **Verified Working Production Models**:
  - `gemini-flash-lite-latest` (Recommended: high availability, full function calling, zero 503 throttles)
  - `gemini-2.5-flash`
  - `gemini-2.5-pro`
- **Example**: `GEMINI_MODEL=gemini-flash-lite-latest`

### `OPENAI_API_KEY`
- **Description**: OpenAI API key from the OpenAI Developer Platform.
- **Security Requirement**: High Secret.
- **Example**: `OPENAI_API_KEY=sk-proj-...`

### `UPLOAD_DIR`
- **Description**: Path relative to `server/` (or absolute) where Multer stores uploaded PDF, DOCX, CSV, and TXT files for RAG processing.
- **Default**: `uploads` (automatically created on server boot if missing)
- **Example**: `UPLOAD_DIR=uploads`

### `MAX_FILE_SIZE_MB`
- **Description**: Maximum allowable file size for document uploads in megabytes. Enforced by Multer middleware.
- **Default**: `15`
- **Example**: `MAX_FILE_SIZE_MB=15`

---

## 3. Frontend Client Configuration

The frontend client is built with Vite. Vite proxies requests matching `/api` and `/uploads` directly to the backend server during local development (`http://localhost:5000` via `client/vite.config.ts`).

In production static deployments (e.g. Render Static Site), the frontend connects directly to the backend URL via Axios interceptors in `client/src/services/api.ts`. If deploying backend and frontend on separate hostnames, configure:

| Variable | Service | Required? | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Client | Optional | Remote API base URL (defaults to `/api` relative proxy) |

---

## 4. Environment File Placement

```
Venture OS/
├── .env.example          # Root template for docker-compose and full-stack overview
├── server/
│   ├── .env              # Backend local environment file (IGNORED BY GIT)
│   └── .env.example      # Backend template (committed to git)
└── client/
    └── .env.example      # Optional client configuration template
```
