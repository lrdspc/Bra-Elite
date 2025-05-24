import { defineConfig } from "drizzle-kit";
import { getConnectionString } from "./server/db/config"; // Import from new config

// Ensure DATABASE_URL is set in the environment, or construct it
// For local development, Drizzle Kit can use a connection string directly.
// The getConnectionString function from db/config.ts can be used if env vars like DB_HOST etc. are set.
// However, drizzle-kit typically expects process.env.DATABASE_URL to be the full connection string.
// We will rely on process.env.DATABASE_URL being set correctly for PostgreSQL.

if (!process.env.DATABASE_URL) {
  console.warn(
    "Warning: DATABASE_URL environment variable is not set. " +
    "Attempting to construct from DB_HOST, etc. for local generation (if applicable), " +
    "but this should be set directly for migrations and production."
  );
  // As a fallback for local generation, we might try to use getConnectionString()
  // but this is not standard for drizzle-kit. Best to set DATABASE_URL.
  // For now, we'll throw an error if not set, to enforce clear configuration.
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
    "Please set it to your PostgreSQL connection string (e.g., postgresql://user:password@host:port/db)."
  );
}

export default defineConfig({
  out: "./migrations", // Output directory for migrations
  schema: "./shared/schema.ts", // Path to your schema file
  dialect: "postgresql", // Specify PostgreSQL dialect
  dbCredentials: {
    url: process.env.DATABASE_URL, // Drizzle Kit uses this connection string
  },
  verbose: true, // Optional: for more detailed output
  strict: true, // Optional: for stricter checks
});
