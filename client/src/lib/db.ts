import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BrasilitDB extends DBSchema {
  inspections: {
    key: string;
    value: {
      id: string;
      title: string;
      clientName: string;
      address: string;
      date: string;
      status: 'draft' | 'pending' | 'completed';
      syncStatus: 'synced' | 'pending' | 'failed';
      data: any;
      updatedAt: number;
    };
    indexes: { 'by-status': string; 'by-sync': string; 'by-date': string };
  };
  images: {
    key: string;
    value: {
      id: string;
      inspectionId: string;
      blob: Blob;
      thumbnail: Blob;
      caption: string;
      syncStatus: 'synced' | 'pending' | 'failed';
      updatedAt: number;
    };
    indexes: { 'by-inspection': string; 'by-sync': string };
  };
  userData: {
    key: string;
    value: {
      id: string;
      data: any;
      updatedAt: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<BrasilitDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<BrasilitDB>('brasilit-db', 1, {
      upgrade(db) {
        // Inspeções
        if (!db.objectStoreNames.contains('inspections')) {
          const inspectionStore = db.createObjectStore('inspections', { keyPath: 'id' });
          inspectionStore.createIndex('by-status', 'status');
          inspectionStore.createIndex('by-sync', 'syncStatus');
          inspectionStore.createIndex('by-date', 'updatedAt');
        }

        // Imagens
        if (!db.objectStoreNames.contains('images')) {
          const imageStore = db.createObjectStore('images', { keyPath: 'id' });
          imageStore.createIndex('by-inspection', 'inspectionId');
          imageStore.createIndex('by-sync', 'syncStatus');
        }

        // Dados do usuário
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'id' });
        }
      }
    });
  }
  return dbPromise;
};

// API para inspeções
export const inspectionDB = {
  async getAll() {
    const db = await initDB();
    return db.getAll('inspections');
  },

  async getById(id: string) {
    const db = await initDB();
    return db.get('inspections', id);
  },

  async save(inspection: any) {
    const db = await initDB();
    inspection.updatedAt = Date.now();
    return db.put('inspections', inspection);
  },

  async delete(id: string) {
    const db = await initDB();
    return db.delete('inspections', id);
  },

  async getPendingSync() {
    const db = await initDB();
    return db.getAllFromIndex('inspections', 'by-sync', 'pending');
  }
};

// API para imagens
export const imageDB = {
  async getByInspection(inspectionId: string) {
    const db = await initDB();
    return db.getAllFromIndex('images', 'by-inspection', inspectionId);
  },

  async save(image: any) {
    const db = await initDB();
    image.updatedAt = Date.now();
    return db.put('images', image);
  },

  async delete(id: string) {
    const db = await initDB();
    return db.delete('images', id);
  },

  async getPendingSync() {
    const db = await initDB();
    return db.getAllFromIndex('images', 'by-sync', 'pending');
  }
};

// API para dados do usuário
export const userDataDB = {
  async get(id: string) {
    const db = await initDB();
    return db.get('userData', id);
  },

  async save(data: any) {
    const db = await initDB();
    data.updatedAt = Date.now();
    return db.put('userData', data);
  }
};

// Inicializa o banco de dados
initDB().catch(err => {
  console.error('Erro ao inicializar o banco de dados:', err);
});