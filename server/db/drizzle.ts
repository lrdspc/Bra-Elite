import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getConnectionString } from './config';
import * as schema from '../../shared/schema'; // Adjust path as necessary

const connectionString = getConnectionString();

// For query client
const queryClient = postgres(connectionString);
// For Drizzle ORM
const migrationClient = postgres(connectionString, { max: 1 }); // Max 1 connection for migrations

// Export Drizzle instance with the schema
export const db = drizzle(queryClient, { schema });

// Export migration client separately if needed by Drizzle Kit for migrations
// (though Drizzle Kit often handles its own connection if connectionString is in drizzle.config.ts)
export const migrator = drizzle(migrationClient, { schema });

// Optional: A function to test the connection
export const testConnection = async () => {
  try {
    await queryClient`SELECT 1`; // Simple query to test connection
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    // process.exit(1); // Optionally exit if connection fails on startup
  }
};

// Call testConnection on startup if you want to verify DB connection immediately
// testConnection();
