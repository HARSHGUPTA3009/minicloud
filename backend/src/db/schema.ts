import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", ["active","building","failed","stopped"]);
export const deploymentStatusEnum = pgEnum("deployment_status", ["queued","building","deploying","running","failed","stopped","rolled_back"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  githubRepo: text("github_repo").notNull(),
  githubBranch: text("github_branch").notNull().default("main"),
  webhookSecret: text("webhook_secret").notNull(),
  status: projectStatusEnum("status").notNull().default("stopped"),
  subdomain: text("subdomain").notNull().unique(),
  envVars: jsonb("env_vars").notNull().default([]),
  resourceLimits: jsonb("resource_limits").notNull().default({ cpuShares: 512, memoryMb: 512, storageGb: 5 }),
  autoRedeploy: boolean("auto_redeploy").notNull().default(true),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deployments = pgTable("deployments", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  commitSha: text("commit_sha").notNull(),
  commitMessage: text("commit_message").notNull(),
  commitAuthor: text("commit_author").notNull(),
  branch: text("branch").notNull(),
  status: deploymentStatusEnum("status").notNull().default("queued"),
  buildStep: text("build_step").notNull().default("clone"),
  imageTag: text("image_tag").notNull(),
	containerName: text("container_name"),
  containerId: text("container_id"),
  port: integer("port"),
  logs: jsonb("logs").notNull().default([]),
  isActive: boolean("is_active").notNull().default(false),
  triggeredBy: text("triggered_by").notNull().default("manual"),
  healthStatus: text("health_status").default("unknown"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  finishedAt: timestamp("finished_at"),
  duration: integer("duration"),
  deploymentPort: integer("deployment_port"),
  localUrl: text("local_url"),
  deploymentUrl: text("deployment_url"),
});

export const metrics = pgTable("metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(),
  deploymentId: uuid("deployment_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  cpu: integer("cpu").notNull().default(0),
  memory: integer("memory").notNull().default(0),
  memoryLimit: integer("memory_limit").notNull().default(512),
  networkIn: integer("network_in").notNull().default(0),
  networkOut: integer("network_out").notNull().default(0),
});
