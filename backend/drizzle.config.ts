import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",   // ✅ FIXED PATH
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;