import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import httpProxy from "http-proxy";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { config } from "./config";
import { authMiddleware } from "./middleware/auth";
import { db } from "./db/client";
import { users, deployments } from "./db/schema";
import { startHealthCheckScheduler } from "./services/health.service";
import projectsRouter from "./routes/projects";
import deploymentsRouter from "./routes/deployments";
import webhooksRouter from "./routes/webhooks";
import metricsRouter from "./routes/metrics";
import logsRouter from "./routes/logs";

const app = express();
const httpServer = createServer(app);
const proxy = httpProxy.createProxyServer({});

export const io = new SocketIO(httpServer, { cors: { origin: "*" } });

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const [user] = await db.insert(users).values({ email, passwordHash: await bcrypt.hash(password, 12), name }).returning();
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: "30d" });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user || !await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: "30d" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.use("/webhooks", webhooksRouter);
app.use("/api/projects", authMiddleware, projectsRouter);
app.use("/api/deployments", authMiddleware, deploymentsRouter);
app.use("/api/metrics", authMiddleware, metricsRouter);
app.use("/api/logs", authMiddleware, logsRouter);

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use("/", async (req, res) => {
  try {
    const active = await db.query.deployments.findFirst({
      where: eq(deployments.isActive, true),
    });

    if (!active?.localUrl) {
      return res.status(404).send("No active deployment");
    }

    req.url = req.url || "/";
    
    proxy.web(req, res, { 
      target: active.localUrl,
      changeOrigin: true,
      selfHandleResponse: false,
    }, (err) => {
      res.status(502).send("Deployment unreachable");
    });
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});
io.on("connection", socket => {
  socket.on("subscribe:deployment", id => socket.join(`deployment:${id}`));
  socket.on("subscribe:project", id => socket.join(`project:${id}`));
});

startHealthCheckScheduler(30000);
httpServer.listen(config.port, () => console.log(`🚀 MiniCloud API on :${config.port}`));