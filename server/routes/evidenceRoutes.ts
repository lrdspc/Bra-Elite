import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises'; // For file deletion
import { storageService } from '../services/storageService';
import { protect, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import { RoleEnum } from '@/shared/schema';

const router = express.Router();

// Ensure the upload directory exists
const UPLOADS_EVIDENCES_DIR = path.join(process.cwd(), 'uploads', 'evidences');
fs.mkdir(UPLOADS_EVIDENCES_DIR, { recursive: true })
  .catch(err => console.error("Failed to create uploads directory:", err));

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_EVIDENCES_DIR);
  },
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: function (req, file, cb) {
    // Allow images and PDFs for now
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File type not allowed! Only images and PDFs are permitted.'));
  }
});

// POST /api/evidences - Create new evidence (with file upload)
router.post(
  '/', 
  protect, 
  authorize(RoleEnum.Admin, RoleEnum.Gestor, RoleEnum.Tecnico), 
  upload.single('evidenceFile'), // 'evidenceFile' is the name of the form field for the file
  async (req: AuthenticatedRequest, res) => {
    try {
      const { inspectionId, category, notes } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: 'Evidence file is required.' });
      }
      if (!inspectionId) {
        // If file uploaded but other data missing, delete the uploaded file
        await fs.unlink(req.file.path);
        return res.status(400).json({ message: 'Inspection ID is required.' });
      }

      const evidenceData = {
        inspectionId: parseInt(inspectionId, 10),
        fileKey: req.file.path, // Path where multer saved the file
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        category,
        notes,
        uploadedBy: req.user?.id, // Assuming req.user is populated by 'protect' middleware
      };

      const newEvidence = await storageService.createEvidence(evidenceData);
      if (newEvidence) {
        res.status(201).json(newEvidence);
      } else {
        // If DB insertion fails, delete the uploaded file
        await fs.unlink(req.file.path);
        res.status(400).json({ message: 'Invalid evidence data or failed to save to DB' });
      }
    } catch (error: any) {
      console.error('Error creating evidence:', error);
      // If an error occurs and a file was uploaded, attempt to delete it
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file after failed evidence creation:', unlinkError);
        }
      }
      if (error.message.includes('File type not allowed')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Server error creating evidence' });
    }
  }
);

// GET /api/evidences/inspection/:inspectionId - Get all evidences for an inspection
router.get('/inspection/:inspectionId', protect, async (req, res) => {
  try {
    const inspectionId = parseInt(req.params.inspectionId, 10);
    if (isNaN(inspectionId)) {
      return res.status(400).json({ message: 'Invalid inspection ID format' });
    }
    const evidences = await storageService.getEvidencesByInspectionId(inspectionId);
    res.json(evidences);
  } catch (error) {
    console.error(`Error fetching evidences for inspection ${req.params.inspectionId}:`, error);
    res.status(500).json({ message: 'Server error fetching evidences' });
  }
});

// GET /api/evidences/:id - Get a single evidence by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid evidence ID format' });
    }
    const evidence = await storageService.getEvidence(id);
    if (evidence) {
      res.json(evidence);
    } else {
      res.status(404).json({ message: 'Evidence not found' });
    }
  } catch (error) {
    console.error(`Error fetching evidence ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error fetching evidence' });
  }
});


// PUT /api/evidences/:id - Update evidence (metadata and optionally the file)
router.put(
  '/:id', 
  protect, 
  authorize(RoleEnum.Admin, RoleEnum.Gestor, RoleEnum.Tecnico), 
  upload.single('evidenceFile'), // Allow file update
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid evidence ID format' });
      }

      const existingEvidence = await storageService.getEvidence(id);
      if (!existingEvidence) {
        // If a new file was uploaded during a failed update attempt for a non-existent record
        if (req.file) await fs.unlink(req.file.path);
        return res.status(404).json({ message: 'Evidence not found for update' });
      }
      
      // Ownership check (optional, similar to inspections)
      if (req.user && req.user.role === RoleEnum.Tecnico && existingEvidence.uploadedBy !== req.user.id) {
          // More robust check might involve fetching user details
          return res.status(403).json({ message: 'Forbidden: You can only update your own evidences.' });
      }

      const { inspectionId, category, notes } = req.body;
      const evidenceUpdateData: Partial<NewEvidence> = {
        updatedAt: new Date(), // Explicitly set updatedAt
      };

      if (inspectionId) evidenceUpdateData.inspectionId = parseInt(inspectionId, 10);
      if (category) evidenceUpdateData.category = category;
      if (notes) evidenceUpdateData.notes = notes;

      let oldFilePath: string | null = null;

      if (req.file) {
        evidenceUpdateData.fileKey = req.file.path;
        evidenceUpdateData.fileName = req.file.originalname;
        evidenceUpdateData.fileType = req.file.mimetype;
        evidenceUpdateData.fileSize = req.file.size;
        oldFilePath = existingEvidence.fileKey; // Keep track of old file to delete after DB update
      }

      const updatedEvidence = await storageService.updateEvidence(id, evidenceUpdateData);

      if (updatedEvidence) {
        // If update was successful and a new file was uploaded, delete the old file
        if (oldFilePath && oldFilePath !== updatedEvidence.fileKey) { // Ensure they are different
          try {
            await fs.unlink(oldFilePath);
          } catch (unlinkError) {
            console.error('Error deleting old evidence file after update:', unlinkError);
            // Log this error, but the main operation was successful
          }
        }
        res.json(updatedEvidence);
      } else {
        // If DB update failed but a new file was uploaded, delete the new file
        if (req.file) await fs.unlink(req.file.path);
        res.status(400).json({ message: 'Could not update evidence' });
      }
    } catch (error: any) {
      console.error(`Error updating evidence ${req.params.id}:`, error);
      // If an error occurs and a new file was uploaded, attempt to delete it
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file after failed evidence update:', unlinkError);
        }
      }
      if (error.message.includes('File type not allowed')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Server error updating evidence' });
    }
  }
);

// DELETE /api/evidences/:id - Delete evidence (DB record and file)
router.delete('/:id', protect, authorize(RoleEnum.Admin, RoleEnum.Gestor, RoleEnum.Tecnico), async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid evidence ID format' });
    }

    const evidence = await storageService.getEvidence(id);
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    // Ownership check (optional)
    if (req.user && req.user.role === RoleEnum.Tecnico && evidence.uploadedBy !== req.user.id) {
         return res.status(403).json({ message: 'Forbidden: You can only delete your own evidences.' });
    }

    const deleteResult = await storageService.deleteEvidence(id);

    if (deleteResult.success) {
      if (deleteResult.filePath) {
        try {
          await fs.unlink(deleteResult.filePath);
        } catch (unlinkError) {
          console.error(`Error deleting evidence file ${deleteResult.filePath}:`, unlinkError);
          // Return success but with a warning about file deletion
          return res.status(200).json({ 
            message: 'Evidence record deleted from DB, but file deletion failed. Please check server logs.',
            dbSuccess: true,
            fileSuccess: false
          });
        }
      }
      res.status(200).json({ message: 'Evidence deleted successfully (DB record and file)' });
      // res.status(204).send(); // Or No Content
    } else {
      res.status(400).json({ message: 'Could not delete evidence from DB' });
    }
  } catch (error) {
    console.error(`Error deleting evidence ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error deleting evidence' });
  }
});

export default router;
