import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb
} from "drizzle-orm/pg-core";
/* ================= USERS ================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  passwordHash: text("password_hash").notNull(),

  name: text("name"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

/* ================= DEPLOYMENTS ================= */

export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),

  projectId: text("project_id").notNull(),

  commitSha: text("commit_sha"),
  commitMessage: text("commit_message"),
  commitAuthor: text("commit_author"),

  branch: text("branch"),
  status: text("status"),
  buildStep: text("build_step"),

  imageTag: text("image_tag"),
  containerId: text("container_id"),

  port: integer("port"),
  deploymentPort: integer("deployment_port"),
  localUrl: text("local_url"),
  deploymentUrl: text("deployment_url"),
  logs: text("logs"),

  isActive: boolean("is_active").default(false),

  triggeredBy: text("triggered_by"),
  healthStatus: text("health_status"),

  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),

  duration: integer("duration"),
});


export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),

  name: text("name").notNull(),

  slug: varchar("slug", { length: 255 })
    .notNull()
    .unique(),

  githubRepo: text("github_repo"),
  githubBranch: text("github_branch"),

  webhookSecret: text("webhook_secret"),

  status: text("status").default("active"),

  subdomain: text("subdomain"),

  envVars: jsonb("env_vars"),

  resourceLimits: jsonb("resource_limits"),

  autoRedeploy: boolean("auto_redeploy").default(false),

  userId: integer("user_id")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});