import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'brasilit_vistoria_db',
  ssl: process.env.DB_SSL === 'true', // Example: add 'require' for Supabase/Neon, false for local
};

// Construct a basic connection string (can be expanded based on driver needs)
export const getConnectionString = (): string => {
  const { host, port, user, password, database } = dbConfig;
  // Ensure password is uri encoded if it contains special characters
  const encodedPassword = encodeURIComponent(password);
  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}${dbConfig.ssl ? '?sslmode=require' : ''}`;
};
