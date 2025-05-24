import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storageService } from '../services/storageService'; // To fetch full user if needed
import { User } from '@/shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-secret-key-32-chars';

export interface AuthenticatedRequest extends Request {
  user?: User; // Or a more specific User type from your schema
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Allow Bearer token for API clients or testing (optional)
  // else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  //   token = req.headers.authorization.split(' ')[1];
  // }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }; // Adjust payload structure as needed

    // Get user from the token payload
    // Optionally, fetch the full user from the database if more details are needed
    // For simplicity, we'll use the ID from the token.
    // If you need fresh user data (e.g. to check if user is still active or role changes):
    // req.user = await storageService.getUser(decoded.id);
    // if (!req.user) {
    //   return res.status(401).json({ message: 'Not authorized, user not found' });
    // }
    
    // For now, just attaching the decoded ID as part of a minimal user object
    // In a real app, you'd fetch the user to ensure they exist and are active
    req.user = { id: decoded.id } as User; // Cast to User, ensure this is compatible

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Optional: Middleware to check for specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
    }
    next();
  };
};
