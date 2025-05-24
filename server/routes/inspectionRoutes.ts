import express from 'express';
import { storageService } from '../services/storageService';
import { protect, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import { RoleEnum, InspectionStatusEnum } from '@/shared/schema'; // Assuming these enums are exported

const router = express.Router();

// GET /api/inspections - Get all inspections (with optional filters)
router.get('/', protect, async (req: AuthenticatedRequest, res) => {
  try {
    // Filters like ?status=completed or ?userId=... or ?projectId=...
    const filters = req.query as any; // Cast to any or define a stricter type for query params
    // If the user is a 'tecnico', only show their inspections unless they are also admin/gestor
    // This logic might be better placed in the storageService or a dedicated query builder
    if (req.user && req.user.role === RoleEnum.Tecnico) {
        // Ensure a 'tecnico' can only see their own inspections if no other admin/gestor role is present
        // This is a simplified check. A robust system might check against multiple roles or permissions.
        if (!filters.userId || filters.userId !== req.user.id) {
            filters.userId = req.user.id; // Force filter by current tecnico's ID
        }
    }

    const inspections = await storageService.getInspections(filters);
    res.json(inspections);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    res.status(500).json({ message: 'Server error fetching inspections' });
  }
});

// POST /api/inspections - Create a new inspection
router.post('/', protect, authorize(RoleEnum.Admin, RoleEnum.Gestor, RoleEnum.Tecnico), async (req: AuthenticatedRequest, res) => {
  try {
    const inspectionData = req.body;
    // Add validation: ensure required fields like clientId, projectId, etc. are present
    if (!inspectionData.clientId || !inspectionData.projectId || !inspectionData.type) {
        return res.status(400).json({ message: "Client ID, Project ID, and Type are required." });
    }
    // Set creatorId if not already set (e.g. admin creating for someone else)
    if (!inspectionData.creatorId && req.user) {
        inspectionData.creatorId = req.user.id;
    }
    // Default status if not provided
    if (!inspectionData.status) {
        inspectionData.status = InspectionStatusEnum.Draft;
    }

    const newInspection = await storageService.createInspection(inspectionData);
    if (newInspection) {
      res.status(201).json(newInspection);
    } else {
      res.status(400).json({ message: 'Invalid inspection data' });
    }
  } catch (error) {
    console.error('Error creating inspection:', error);
    res.status(500).json({ message: 'Server error creating inspection' });
  }
});

// GET /api/inspections/:id - Get a single inspection by ID
router.get('/:id', protect, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid inspection ID format' });
    }
    const inspection = await storageService.getInspection(id);

    if (inspection) {
      // Optional: Add ownership/role check if a 'tecnico' should only see their own detailed inspection
      if (req.user && req.user.role === RoleEnum.Tecnico && inspection.assignedTo !== req.user.id && inspection.creatorId !== req.user.id) {
         // Admins/Gestores can see any
        const userDetails = await storageService.getUser(req.user.id);
        if (userDetails && userDetails.role === RoleEnum.Tecnico) { // Double check role from DB if needed
             return res.status(403).json({ message: 'Forbidden: You can only view your own inspections.' });
        }
      }
      res.json(inspection);
    } else {
      res.status(404).json({ message: 'Inspection not found' });
    }
  } catch (error) {
    console.error(`Error fetching inspection ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error fetching inspection' });
  }
});

// PUT /api/inspections/:id - Update an inspection by ID
router.put('/:id', protect, authorize(RoleEnum.Admin, RoleEnum.Gestor, RoleEnum.Tecnico), async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid inspection ID format' });
    }
    const inspectionData = req.body;
    
    // Optional: Add ownership check if a 'tecnico' should only update their own inspection
    if (req.user && req.user.role === RoleEnum.Tecnico) {
        const existingInspection = await storageService.getInspection(id);
        if (!existingInspection || (existingInspection.assignedTo !== req.user.id && existingInspection.creatorId !== req.user.id)) {
            const userDetails = await storageService.getUser(req.user.id);
            if (userDetails && userDetails.role === RoleEnum.Tecnico) {
                return res.status(403).json({ message: 'Forbidden: You can only update your own inspections.' });
            }
        }
    }

    const updatedInspection = await storageService.updateInspection(id, inspectionData);
    if (updatedInspection) {
      res.json(updatedInspection);
    } else {
      const existingInspection = await storageService.getInspection(id);
      if (!existingInspection) {
        return res.status(404).json({ message: 'Inspection not found for update' });
      }
      res.status(400).json({ message: 'Could not update inspection' });
    }
  } catch (error) {
    console.error(`Error updating inspection ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error updating inspection' });
  }
});

// DELETE /api/inspections/:id - Delete an inspection by ID
router.delete('/:id', protect, authorize(RoleEnum.Admin, RoleEnum.Gestor), async (req, res) => {
  // Tecnicos usually shouldn't delete inspections, only Admins or Gestores.
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid inspection ID format' });
    }
    // TODO: Implement storageService.deleteInspection(id)
    // Consider implications: what happens to evidences linked to this inspection?
    // Soft delete is often preferred.
    const inspection = await storageService.getInspection(id);
    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }
    console.warn(`DELETE /api/inspections/${id} - storageService.deleteInspection not yet implemented.`);
    res.status(200).json({ message: `Inspection ${id} would be deleted (not implemented)` });
    // res.status(204).send();
  } catch (error) {
    console.error(`Error deleting inspection ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error deleting inspection' });
  }
});

export default router;
