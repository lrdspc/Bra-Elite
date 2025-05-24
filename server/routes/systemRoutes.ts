import express from 'express';
import { storageService } from '../services/storageService';
import { protect, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import { RoleEnum } from '@/shared/schema';

const router = express.Router();

// POST /api/system/reset-data - Reset all application data
router.post(
  '/reset-data',
  protect, // Ensure user is logged in
  authorize(RoleEnum.Admin), // Only allow Admins to reset data
  async (req: AuthenticatedRequest, res) => {
    try {
      // Additional check: ensure this is not accidentally run in production
      if (process.env.NODE_ENV === 'production' && req.body.confirm !== 'RESET_PRODUCTION_DATA') {
        // Add a confirmation step for production, e.g., require a specific body payload
        return res.status(403).json({ 
          message: 'Forbidden: Resetting data in production requires specific confirmation. This is a destructive operation.' 
        });
      }

      await storageService.resetData();
      res.status(200).json({ message: 'System data has been reset successfully.' });
    } catch (error) {
      console.error('Error resetting system data:', error);
      res.status(500).json({ message: 'Server error during data reset.' });
    }
  }
);

export default router;
