CREATE TABLE IF NOT EXISTS "deployments" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"commit_sha" text,
	"commit_message" text,
	"commit_author" text,
	"branch" text,
	"status" text,
	"build_step" text,
	"image_tag" text,
	"container_id" text,
	"port" integer,
	"logs" text,
	"is_active" boolean DEFAULT false,
	"triggered_by" text,
	"health_status" text,
	"started_at" timestamp,
	"finished_at" timestamp,
	"duration" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"github_repo" text,
	"github_branch" text,
	"webhook_secret" text,
	"status" text DEFAULT 'active',
	"subdomain" text,
	"env_vars" jsonb,
	"resource_limits" jsonb,
	"auto_redeploy" boolean DEFAULT false,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
