import { openDB, deleteDB, DBSchema, IDBPDatabase } from 'idb';
import { Client, Project, Inspection, Evidence, User } from '@shared/schema';

export interface BrasilitDB extends DBSchema {
  clients: {
    key: number;
    value: Client;
    indexes: { 'by-name': string };
  };
  projects: {
    key: number;
    value: Project;
    indexes: { 'by-client': number };
  };
  inspections: {
    key: number;
    value: Inspection;
    indexes: {
      'by-user': number;
      'by-client': number;
      'by-project': number;
      'by-status': string;
      'by-date': Date;
    };
  };
  evidences: {
    key: number;
    value: Evidence;
    indexes: { 'by-inspection': number };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      method: string;
      url: string;
      body?: any;
      timestamp: number;
      attempts: number;
    };
  };
}

// Initialize the IndexedDB database
let dbPromise: Promise<IDBPDatabase<BrasilitDB>>;

export async function initDB(): Promise<IDBPDatabase<BrasilitDB>> {
  if (!dbPromise) {
    dbPromise = openDB<BrasilitDB>('brasilit-vistorias', 1, {
      upgrade(db) {
        // Clients store
        if (!db.objectStoreNames.contains('clients')) {
          const clientStore = db.createObjectStore('clients', { keyPath: 'id' });
          clientStore.createIndex('by-name', 'name');
        }
        
        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('by-client', 'clientId');
        }
        
        // Inspections store
        if (!db.objectStoreNames.contains('inspections')) {
          const inspectionStore = db.createObjectStore('inspections', { keyPath: 'id' });
          inspectionStore.createIndex('by-user', 'userId');
          inspectionStore.createIndex('by-client', 'clientId');
          inspectionStore.createIndex('by-project', 'projectId');
          inspectionStore.createIndex('by-status', 'status');
          inspectionStore.createIndex('by-date', 'scheduledDate');
        }
        
        // Evidences store
        if (!db.objectStoreNames.contains('evidences')) {
          const evidenceStore = db.createObjectStore('evidences', { keyPath: 'id' });
          evidenceStore.createIndex('by-inspection', 'inspectionId');
        }
        
        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
      }
    });
  }
  
  return dbPromise;
}

// Client CRUD operations
export async function saveClient(client: Client): Promise<number> {
  const db = await initDB();
  return db.put('clients', client);
}

export async function getClient(id: number): Promise<Client | undefined> {
  const db = await initDB();
  return db.get('clients', id);
}

export async function getAllClients(): Promise<Client[]> {
  const db = await initDB();
  return db.getAll('clients');
}

export async function deleteClient(id: number): Promise<void> {
  const db = await initDB();
  return db.delete('clients', id);
}

// Project CRUD operations
export async function saveProject(project: Project): Promise<number> {
  const db = await initDB();
  return db.put('projects', project);
}

export async function getProject(id: number): Promise<Project | undefined> {
  const db = await initDB();
  return db.get('projects', id);
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await initDB();
  return db.getAll('projects');
}

export async function getProjectsByClient(clientId: number): Promise<Project[]> {
  const db = await initDB();
  const index = db.transaction('projects').store.index('by-client');
  return index.getAll(clientId);
}

export async function deleteProject(id: number): Promise<void> {
  const db = await initDB();
  return db.delete('projects', id);
}

// Inspection CRUD operations
export async function saveInspection(inspection: Inspection): Promise<number> {
  const db = await initDB();
  return db.put('inspections', inspection);
}

export async function getInspection(id: number): Promise<Inspection | undefined> {
  const db = await initDB();
  return db.get('inspections', id);
}

export async function getAllInspections(): Promise<Inspection[]> {
  const db = await initDB();
  return db.getAll('inspections');
}

export async function getInspectionsByUser(userId: number): Promise<Inspection[]> {
  const db = await initDB();
  const index = db.transaction('inspections').store.index('by-user');
  return index.getAll(userId);
}

export async function getInspectionsByClient(clientId: number): Promise<Inspection[]> {
  const db = await initDB();
  const index = db.transaction('inspections').store.index('by-client');
  return index.getAll(clientId);
}

export async function getInspectionsByProject(projectId: number): Promise<Inspection[]> {
  const db = await initDB();
  const index = db.transaction('inspections').store.index('by-project');
  return index.getAll(projectId);
}

export async function getInspectionsByStatus(status: string): Promise<Inspection[]> {
  const db = await initDB();
  const index = db.transaction('inspections').store.index('by-status');
  return index.getAll(status);
}

export async function deleteInspection(id: number): Promise<void> {
  const db = await initDB();
  return db.delete('inspections', id);
}

// Evidence CRUD operations
export async function saveEvidence(evidence: Evidence): Promise<number> {
  const db = await initDB();
  return db.put('evidences', evidence);
}

export async function getEvidence(id: number): Promise<Evidence | undefined> {
  const db = await initDB();
  return db.get('evidences', id);
}

export async function getEvidencesByInspection(inspectionId: number): Promise<Evidence[]> {
  const db = await initDB();
  const index = db.transaction('evidences').store.index('by-inspection');
  return index.getAll(inspectionId);
}

export async function deleteEvidence(id: number): Promise<void> {
  const db = await initDB();
  return db.delete('evidences', id);
}

// Sync queue operations
export async function addToSyncQueue(method: string, url: string, body?: any): Promise<void> {
  const db = await initDB();
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  await db.add('syncQueue', {
    id,
    method,
    url,
    body,
    timestamp: Date.now(),
    attempts: 0
  });
}

export async function getSyncQueue(): Promise<any[]> {
  const db = await initDB();
  return db.getAll('syncQueue');
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await initDB();
  return db.delete('syncQueue', id);
}

export async function updateSyncQueueItem(id: string, data: any): Promise<void> {
  const db = await initDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    await db.put('syncQueue', { ...item, ...data });
  }
}

// Clear all data
export async function clearAllData(): Promise<void> {
  await deleteDB('brasilit-vistorias');
  dbPromise = initDB();
}

// Bulk operations for initial sync
export async function bulkSaveClients(clients: Client[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('clients', 'readwrite');
  await Promise.all(clients.map(client => tx.store.put(client)));
  await tx.done;
}

export async function bulkSaveProjects(projects: Project[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('projects', 'readwrite');
  await Promise.all(projects.map(project => tx.store.put(project)));
  await tx.done;
}

export async function bulkSaveInspections(inspections: Inspection[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('inspections', 'readwrite');
  await Promise.all(inspections.map(inspection => tx.store.put(inspection)));
  await tx.done;
}

export async function bulkSaveEvidences(evidences: Evidence[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('evidences', 'readwrite');
  await Promise.all(evidences.map(evidence => tx.store.put(evidence)));
  await tx.done;
}
