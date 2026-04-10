# ⚡ MiniCloud

> A self-hosted mini cloud platform — connect GitHub repos, push code, and get live deployments with subdomains, rolling updates, metrics, and real-time logs.

```
┌─────────────────────────────────────────┐
│          Frontend  (React + Vite)        │
└──────────────┬──────────────────────────┘
               │ REST + WebSocket
┌──────────────▼──────────────────────────┐
│          Backend  (Express + TS)         │
│  Auth · Projects · Deployments · Metrics │
└──────┬───────────────────────┬──────────┘
       │                       │
  ┌────▼────┐  ┌──────┐  ┌────▼────────┐
  │Postgres │  │Redis │  │Build Worker │
  └─────────┘  └──────┘  └────┬────────┘
                               │
                         ┌─────▼──────┐
                         │   Docker   │
                         └─────┬──────┘
                               │
                         ┌─────▼──────┐
                         │  Traefik   │
                         │  *.local   │
                         └────────────┘
```

---

## Screenshots

**Login**

![Login page](frontend/public/login.png)

**Dashboard**

![Dashboard](frontend/public/dashboard.png)

**Projects**

![Projects list](frontend/public/projects.png)

---

## Features

| | Feature |
|---|---|
| 🔗 | GitHub webhook auto-deploy on push |
| 🐳 | Docker image build and run per project |
| 📋 | Redis/BullMQ build queue with retries |
| 🌐 | Automatic subdomain per project via Traefik |
| 🔄 | Zero-downtime rolling updates |
| 📜 | Full deployment history with one-click rollback |
| 📊 | CPU, memory, and network metrics with charts |
| 🔒 | Secret env vars with masking |
| 🏥 | Container health checks |
| 📡 | Real-time build logs via WebSocket |
| ⚙️ | Per-project resource limits (CPU, memory, storage) |

---

## Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose

### 1. Clone and install

```bash
git clone <repo> minicloud && cd minicloud
npm install
```

### 2. Start infrastructure

```bash
npm run docker:up
# starts Postgres, Redis, and Traefik
```

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
# open backend/.env and set JWT_SECRET at minimum
```

### 4. Run database migrations

```bash
cd backend && npx drizzle-kit push
```

### 5. Start the development servers

```bash
# Terminal 1 — API server
npm run dev:backend

# Terminal 2 — Build worker
npm run dev:worker

# Terminal 3 — Frontend
npm run dev:frontend
```

Open **http://localhost:3000**, register an account, and deploy your first project.

---

## Docker (Full Stack)

To run everything in containers:

```bash
docker-compose up --build -d
```

---

## GitHub Webhook Setup

1. Create a project in MiniCloud
2. Copy the webhook URL from **Project → Settings**
3. In your GitHub repo go to **Settings → Webhooks → Add webhook**
   - **Payload URL:** `http://YOUR_IP:3001/webhooks/<PROJECT_ID>`
   - **Content type:** `application/json`
   - **Events:** Push

Every push to the configured branch will trigger an automatic deploy.

---

## API Reference

### Auth

```
POST   /auth/register
POST   /auth/login
```

### Projects

```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/deploy
```

### Deployments

```
GET    /api/deployments?projectId=
GET    /api/deployments/:id
POST   /api/deployments/:id/rollback
POST   /api/deployments/:id/stop
```

### Metrics & Logs

```
GET    /api/metrics/:projectId?range=1h|6h|24h|7d
GET    /api/logs/:deploymentId
GET    /api/logs/:deploymentId/runtime
```

### Webhooks

```
POST   /webhooks/:projectId
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `JWT_SECRET` | — | **Required. Change before deploying.** |
| `BASE_DOMAIN` | `localhost` | Base domain for project subdomains |
| `PORT` | `3001` | API server port |
| `MAX_CONCURRENT_BUILDS` | `3` | Build worker concurrency |
| `BUILD_CACHE_PATH` | `/tmp/builds` | Scratch directory for builds |

---

## Tech Stack

**Backend:** Express · TypeScript · Drizzle ORM · PostgreSQL · BullMQ · Redis · Dockerode · Socket.IO · Zod · JWT

**Frontend:** React 18 · Vite · TanStack Query · Recharts · Tailwind CSS · React Router

**Infrastructure:** Docker · Traefik v3 · PostgreSQL 16 · Redis 7

---
