# VentureOS | Production Deployment & Hosting Guide

This guide provides step-by-step instructions for deploying **VentureOS** to cloud infrastructure using **Render** and **MongoDB Atlas**.

---

## 1. Production Architecture Overview

```
[ User Browser ]
       │
       ▼
[ Render Cloud Network ]
  ├── Static Site (Frontend SPA)    ──► https://ventureos-app.onrender.com (Vite dist bundle)
  │                                           │ (Communicates via VITE_API_URL)
  │                                           ▼
  └── Web Service (Backend API)     ──► https://venture-os-nh3b.onrender.com (Node.js/Express)
                                              │
                                              ▼
[ MongoDB Atlas (Cloud Database) ]  ──► cluster0.1h8d3vm.mongodb.net/ventureos
```

---

## 2. Step 1: MongoDB Atlas Database Setup

1. **Create an Atlas Account**: Visit [mongodb.com/atlas](https://www.mongodb.com/atlas) and create an organization.
2. **Deploy a Free/Shared Cluster**: Select the M0 Free tier in your desired geographic region.
3. **Database Access (Security)**:
   - Create a database user (e.g. `ventureos_app`) with password authentication.
   - Grant role: `readWriteAnyDatabase` (or read/write on the `ventureos` database).
4. **Network Access**:
   - Add IP Access List entry: `0.0.0.0/0` (Allow access from anywhere, required for dynamic cloud hosting IPs).
5. **Obtain Connection String**:
   - Choose "Connect" -> "Drivers" -> "Node.js".
   - Copy URI: `mongodb+srv://ventureos_app:<PASSWORD>@cluster0.abcde.mongodb.net/ventureos?retryWrites=true&w=majority`.

---

## 3. Step 2: Render Backend Web Service Setup

1. Log in to [dashboard.render.com](https://dashboard.render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository containing VentureOS.
3. Configure settings:
   - **Name**: `ventureos-api`
   - **Region**: Same region as your MongoDB cluster.
   - **Branch**: `main`
   - **Root Directory**: (Leave blank or set to `server`)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build --workspace=server
     ```
   - **Start Command**:
     ```bash
     node server/dist/server.js
     ```
4. Add **Environment Variables** in the Render Dashboard:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://ventureos_app:<PASSWORD>@cluster0.abcde.mongodb.net/ventureos?retryWrites=true&w=majority` |
   | `JWT_SECRET` | High-entropy random 64-char hex string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | `https://ventureos.onrender.com` (your frontend Render URL) |
   | `AI_PROVIDER` | `gemini` (or `mock` / `openai`) |
   | `GEMINI_API_KEY` | Your Google AI Studio API Key |
   | `GEMINI_MODEL` | `gemini-flash-lite-latest` |
5. Click **Deploy Web Service**.
6. Verify deployment by visiting `https://ventureos-api.onrender.com/api/health`.
   Expected response: `{ "status": "healthy", "platform": "VentureOS" }`.

---

## 4. Step 3: Render Frontend Static Site Setup

1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect the same GitHub repository.
3. Configure settings:
   - **Name**: `ventureos`
   - **Branch**: `main`
   - **Root Directory**: (Leave blank or set to `client`)
   - **Build Command**:
     ```bash
     npm install && npm run build --workspace=client
     ```
   - **Publish Directory**: `client/dist`
4. Configure **Rewrite Rules (Single-Page App Routing)**:
   - In the "Redirects/Rewrites" tab:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`
5. Click **Deploy Static Site**.

---

## 5. Local Production Build Testing

Before deploying to the cloud, you can test the production build locally:

```bash
# 1. Clean build across both workspaces
npm run build

# 2. Run backend production server
npm start
# Server runs from server/dist/server.js listening on port 5000

# 3. Preview frontend production bundle
cd client
npm run preview
# Serves dist/ on http://localhost:4173
```

---

## 6. Post-Deployment Smoke Test Checklist

- [ ] Visit `/api/health` on the backend service -> returns `200 OK`.
- [ ] Visit the frontend root URL -> loads the Dark Premium Landing Page.
- [ ] Navigate to `/register` -> create an account and verify workspace initialization.
- [ ] Log in with the pre-seeded account (`alex@ventureos.io` / `password123`).
- [ ] Open the **AI Business Copilot** drawer and ask: *"How is our business performing?"*.
- [ ] Go to **Projects** -> click **AI Project Planner** -> generate and instantiate a plan.
- [ ] Upload a PDF to **Documents** -> query the RAG search bar.
