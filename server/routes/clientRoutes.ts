import express from 'express';
import { storageService } from '../services/storageService';
import { protect, authorize } from '../middleware/authMiddleware'; // Assuming you might want to protect these
import { RoleEnum } from '@/shared/schema';

const router = express.Router();

// GET /api/clients - Get all clients (with optional filters)
router.get('/', protect, async (req, res) => { // Basic protection, any logged-in user can view
  try {
    // Example of potential query parameters for filtering: req.query.name, req.query.document
    const filters = req.query; // Pass query params directly or map them to ClientFilters
    const clients = await storageService.getClients(filters);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error fetching clients' });
  }
});

// POST /api/clients - Create a new client
router.post('/', protect, authorize(RoleEnum.Admin, RoleEnum.Gestor), async (req, res) => { // Only Admin or Gestor
  try {
    const clientData = req.body;
    // Add validation for clientData here if needed
    if (!clientData.name || !clientData.type) {
        return res.status(400).json({ message: "Client name and type are required." });
    }
    const newClient = await storageService.createClient(clientData);
    if (newClient) {
      res.status(201).json(newClient);
    } else {
      res.status(400).json({ message: 'Invalid client data' });
    }
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error creating client' });
  }
});

// GET /api/clients/:id - Get a single client by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }
    const client = await storageService.getClient(id);
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    console.error(`Error fetching client ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error fetching client' });
  }
});

// PUT /api/clients/:id - Update a client by ID
router.put('/:id', protect, authorize(RoleEnum.Admin, RoleEnum.Gestor), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }
    const clientData = req.body;
    // Add validation for clientData here
    const updatedClient = await storageService.updateClient(id, clientData);
    if (updatedClient) {
      res.json(updatedClient);
    } else {
      // This could be because the client was not found, or update returned null for other reasons
      const existingClient = await storageService.getClient(id);
      if (!existingClient) {
        return res.status(404).json({ message: 'Client not found for update' });
      }
      res.status(400).json({ message: 'Could not update client' });
    }
  } catch (error) {
    console.error(`Error updating client ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error updating client' });
  }
});

// DELETE /api/clients/:id - Delete a client by ID (consider soft delete in a real app)
router.delete('/:id', protect, authorize(RoleEnum.Admin), async (req, res) => { // Only Admin can delete
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }
    // Note: Actual deletion might be complex due to relations (projects, inspections).
    // storageService.deleteClient would need to handle this, or you might prevent deletion if related data exists.
    // For now, assuming a simple delete or that storageService handles cascades/checks.
    // const success = await storageService.deleteClient(id); // Assuming deleteClient returns boolean or similar
    // For this example, we'll simulate by checking if it exists then "deleting" (no actual delete method in IStorage yet)
    const client = await storageService.getClient(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    // TODO: Implement storageService.deleteClient(id)
    // await storageService.deleteClient(id); 
    console.warn(`DELETE /api/clients/${id} - storageService.deleteClient not yet implemented.`);
    res.status(200).json({ message: `Client ${id} would be deleted (not implemented)` }); 
    // res.status(204).send(); // No content on successful deletion
  } catch (error) {
    console.error(`Error deleting client ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error deleting client' });
  }
});

export default router;
