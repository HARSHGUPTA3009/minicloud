# ⚡ MiniCloud

A self-hosted mini cloud platform — connect GitHub repos, push code, and get live deployments with subdomains, rolling updates, metrics, and logs.
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

## Features

| | Feature |
|---|---|
| 🔗 | GitHub webhook auto-deploy |
| 🐳 | Docker image build + run |
| 📋 | Redis/BullMQ build queue with retries |
| 🌐 | Auto subdomain per project |
| 🔄 | Zero-downtime rolling updates |
| 📜 | Full deployment history + rollback |
| 📊 | CPU / memory / network metrics |
| 🔒 | Secret env vars with masking |
| 🏥 | Container health checks |
| 📡 | Real-time build logs via WebSocket |
| ⚙️ | Per-project resource limits |

## Quick Start

### Prerequisites
- Node.js 20+, Docker, Docker Compose

### 1. Install
```bash
git clone <repo> minicloud && cd minicloud
npm install
```

### 2. Start infrastructure
```bash
npm run docker:up
# starts postgres, redis, traefik
```

### 3. Configure
```bash
cp backend/.env.example backend/.env
# edit JWT_SECRET at minimum
```

### 4. Run database migrations
```bash
cd backend && npx drizzle-kit push
```

### 5. Start
```bash
# Terminal 1 – API
npm run dev:backend

# Terminal 2 – Build worker
npm run dev:worker

# Terminal 3 – Frontend
npm run dev:frontend
```

Open **http://localhost:3000**, register, and deploy.

---

## Docker (Full Stack)
```bash
docker-compose up --build -d
```

---

## GitHub Webhook Setup

1. Create a project in MiniCloud
2. Copy the webhook URL from **Project → Settings**
3. GitHub repo → **Settings → Webhooks → Add webhook**
   - Payload URL: `http://YOUR_IP:3001/webhooks/<PROJECT_ID>`
   - Content type: `application/json`
   - Events: **push**

Every push to the configured branch triggers an automatic deploy.

---

## API Reference
```
POST   /auth/register
POST   /auth/login

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/deploy

GET    /api/deployments?projectId=
GET    /api/deployments/:id
POST   /api/deployments/:id/rollback
POST   /api/deployments/:id/stop

GET    /api/metrics/:projectId?range=1h|6h|24h|7d
GET    /api/logs/:deploymentId
GET    /api/logs/:deploymentId/runtime

POST   /webhooks/:projectId
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis URL |
| `JWT_SECRET` | — | **Change in production** |
| `BASE_DOMAIN` | `localhost` | Base domain for subdomains |
| `PORT` | `3001` | API port |
| `MAX_CONCURRENT_BUILDS` | `3` | Worker concurrency |
| `BUILD_CACHE_PATH` | `/tmp/builds` | Build scratch directory |

---

## Tech Stack

**Backend:** Express · TypeScript · Drizzle ORM · PostgreSQL · BullMQ · Redis · Dockerode · Socket.IO · Zod · JWT

**Frontend:** React 18 · Vite · TanStack Query · Recharts · Tailwind CSS · React Router

**Infrastructure:** Docker · Traefik v3 · PostgreSQL 16 · Redis 7

---

## License
MIT
# minicloud
