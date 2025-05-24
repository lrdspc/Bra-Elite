import express from 'express';
import { storageService } from '../services/storageService';
import { protect, authorize } from '../middleware/authMiddleware';
import { RoleEnum } from '@/shared/schema';

const router = express.Router();

// GET /api/projects - Get all projects (with optional filters)
router.get('/', protect, async (req, res) => {
  try {
    // Filters like ?clientId=1 or ?name=ProjectX
    const filters = req.query; 
    const projects = await storageService.getProjects(filters);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
});

// POST /api/projects - Create a new project
router.post('/', protect, authorize(RoleEnum.Admin, RoleEnum.Gestor), async (req, res) => {
  try {
    const projectData = req.body;
    if (!projectData.name || !projectData.clientId) {
        return res.status(400).json({ message: "Project name and clientId are required." });
    }
    // Add more validation as needed
    const newProject = await storageService.createProject(projectData);
    if (newProject) {
      res.status(201).json(newProject);
    } else {
      res.status(400).json({ message: 'Invalid project data' });
    }
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
});

// GET /api/projects/:id - Get a single project by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    const project = await storageService.getProject(id);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    console.error(`Error fetching project ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
});

// PUT /api/projects/:id - Update a project by ID
router.put('/:id', protect, authorize(RoleEnum.Admin, RoleEnum.Gestor), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
     if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    const projectData = req.body;
    // Add validation
    const updatedProject = await storageService.updateProject(id, projectData);
    if (updatedProject) {
      res.json(updatedProject);
    } else {
      const existingProject = await storageService.getProject(id);
      if (!existingProject) {
        return res.status(404).json({ message: 'Project not found for update' });
      }
      res.status(400).json({ message: 'Could not update project' });
    }
  } catch (error) {
    console.error(`Error updating project ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error updating project' });
  }
});

// DELETE /api/projects/:id - Delete a project by ID
router.delete('/:id', protect, authorize(RoleEnum.Admin), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    // TODO: Implement storageService.deleteProject(id)
    // Consider implications: what happens to inspections linked to this project?
    // Soft delete is often preferred.
    const project = await storageService.getProject(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    console.warn(`DELETE /api/projects/${id} - storageService.deleteProject not yet implemented.`);
    res.status(200).json({ message: `Project ${id} would be deleted (not implemented)` });
    // res.status(204).send();
  } catch (error) {
    console.error(`Error deleting project ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

export default router;
