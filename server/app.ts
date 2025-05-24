import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

// Import routes
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import projectRoutes from './routes/projectRoutes';
import inspectionRoutes from './routes/inspectionRoutes';
import evidenceRoutes from './routes/evidenceRoutes';
import systemRoutes from './routes/systemRoutes';
// import { testConnection } from './db/drizzle'; // Optional: for testing DB connection on startup

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---

// CORS Configuration
// Adjust origin to your client's URL in production
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite dev server default
  credentials: true, // Important for cookies
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' })); // For JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For URL-encoded payloads

// Cookie parser
app.use(cookieParser());

// Serve static files from the 'uploads' directory
// This makes files in 'uploads/evidences' accessible via a URL path like /uploads/evidences/filename.jpg
// Note: In production, you might use a dedicated file server or cloud storage.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


// --- API Routes ---
app.get('/api', (req, res) => {
  res.json({ message: 'Backend server is running and accessible' });
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/evidences', evidenceRoutes);
app.use('/api/system', systemRoutes);


// --- Basic Error Handling Middleware ---
// This should be one of the last middleware registered
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err.stack || err.message); // Log the error stack for debugging
  
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // You can add more specific error handling here if needed
  // For example, if err is a custom error type with a statusCode property:
  // if (err.statusCode) {
  //   statusCode = err.statusCode;
  //   message = err.message;
  // }

  res.status(statusCode).json({ 
    message,
    // Optionally include stack in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// --- Start Server ---
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // Optional: Test DB connection on startup
  // try {
  //   await testConnection();
  // } catch (dbError) {
  //   console.error("Failed to connect to database on startup:", dbError);
  //   // process.exit(1); // Or handle appropriately
  // }
});

export default app;
