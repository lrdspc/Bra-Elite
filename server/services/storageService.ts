import { db } from '../db/drizzle';
import * as schema from '../../shared/schema';
import { 
  User, 
  Client, 
  Project, 
  Inspection, 
  Evidence,
  NewUser,
  NewClient,
  NewProject,
  NewInspection,
  NewEvidence
} from '../../shared/schema'; // Ensure these are exported from your schema
import { IStorage, UserFilters, ClientFilters, ProjectFilters, InspectionFilters } from '../types/storage';
import { eq, and, or, like, desc, asc, SQL } from 'drizzle-orm';
import bcrypt from 'bcryptjs'; // For password hashing
import fs from 'fs/promises'; // For file system operations in resetData (evidence file deletion)
import path from 'path'; // For path manipulation

// Define a constant for the uploads directory, relative to the project root
const UPLOADS_EVIDENCES_DIR = path.join(process.cwd(), 'uploads', 'evidences');


export class StorageService implements IStorage {
  
  // --- User Methods ---
  async getUser(id: string): Promise<User | null> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0] || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    // Assuming username is stored in the email field for login purposes
    const result = await db.select().from(schema.users).where(eq(schema.users.email, username)).limit(1);
    return result[0] || null;
  }

  async createUser(userData: NewUser): Promise<User | null> {
    if (!userData.passwordHash) {
      throw new Error("Password hash is required to create a user.");
    }
    // The password should already be hashed before calling this method if not using a trigger
    // For example: userData.passwordHash = await bcrypt.hash(plainPassword, 10);
    const result = await db.insert(schema.users).values(userData).returning();
    return result[0] || null;
  }

  // --- Client Methods ---
  async getClient(id: number): Promise<Client | null> {
    const result = await db.select().from(schema.clients).where(eq(schema.clients.id, id)).limit(1);
    return result[0] || null;
  }

  async getClients(filters?: ClientFilters): Promise<Client[]> {
    let query = db.select().from(schema.clients).$dynamic();
    const conditions: SQL[] = [];

    if (filters?.name) {
      conditions.push(like(schema.clients.name, `%${filters.name}%`));
    }
    if (filters?.document) {
      conditions.push(eq(schema.clients.document, filters.document));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(schema.clients.createdAt));
  }

  async createClient(clientData: NewClient): Promise<Client | null> {
    const result = await db.insert(schema.clients).values(clientData).returning();
    return result[0] || null;
  }

  async updateClient(id: number, clientData: Partial<NewClient>): Promise<Client | null> {
    const result = await db.update(schema.clients)
      .set({ ...clientData, updatedAt: new Date() })
      .where(eq(schema.clients.id, id))
      .returning();
    return result[0] || null;
  }

  // --- Project Methods ---
  async getProject(id: number): Promise<Project | null> {
    const result = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);
    return result[0] || null;
  }

  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    let query = db.select().from(schema.projects).$dynamic();
    const conditions: SQL[] = [];

    if (filters?.clientId) {
      conditions.push(eq(schema.projects.clientId, filters.clientId));
    }
    if (filters?.name) {
      conditions.push(like(schema.projects.name, `%${filters.name}%`));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(schema.projects.createdAt));
  }

  async createProject(projectData: NewProject): Promise<Project | null> {
    const result = await db.insert(schema.projects).values(projectData).returning();
    return result[0] || null;
  }

  async updateProject(id: number, projectData: Partial<NewProject>): Promise<Project | null> {
    const result = await db.update(schema.projects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(schema.projects.id, id))
      .returning();
    return result[0] || null;
  }

  // --- Inspection Methods ---
  async getInspection(id: number): Promise<Inspection | null> {
    // Example of joining with related tables
    const result = await db.query.inspections.findFirst({
      where: eq(schema.inspections.id, id),
      with: {
        client: true,
        project: true,
        user: true, // Assuming 'user' relation for assignedTo (userId)
        evidences: true,
      },
    });
    return result || null;
  }

  async getInspections(filters?: InspectionFilters): Promise<Inspection[]> {
    const conditions: SQL[] = [];
    if (filters?.userId) {
      conditions.push(eq(schema.inspections.assignedTo, filters.userId));
    }
    if (filters?.clientId) {
      conditions.push(eq(schema.inspections.clientId, filters.clientId));
    }
    if (filters?.projectId) {
      conditions.push(eq(schema.inspections.projectId, filters.projectId));
    }
    if (filters?.status) {
      conditions.push(eq(schema.inspections.status, filters.status));
    }
    
    // Example of joining with related tables for list view
    return db.query.inspections.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        client: { columns: { name: true } }, // Select only client name
        project: { columns: { name: true } }, // Select only project name
        user: { columns: { name: true, email: true } }, // Select user name/email
      },
      orderBy: [desc(schema.inspections.scheduledDate), desc(schema.inspections.createdAt)],
    });
  }

  async createInspection(inspectionData: NewInspection): Promise<Inspection | null> {
    const result = await db.insert(schema.inspections).values(inspectionData).returning();
    return result[0] || null;
  }

  async updateInspection(id: number, inspectionData: Partial<NewInspection>): Promise<Inspection | null> {
    const result = await db.update(schema.inspections)
      .set({ ...inspectionData, updatedAt: new Date() })
      .where(eq(schema.inspections.id, id))
      .returning();
    return result[0] || null;
  }

  // --- Evidence Methods ---
  async getEvidence(id: number): Promise<Evidence | null> {
    const result = await db.select().from(schema.evidences).where(eq(schema.evidences.id, id)).limit(1);
    return result[0] || null;
  }

  async getEvidencesByInspectionId(inspectionId: number): Promise<Evidence[]> {
    return db.select().from(schema.evidences).where(eq(schema.evidences.inspectionId, inspectionId)).orderBy(asc(schema.evidences.createdAt));
  }

  async createEvidence(evidenceData: NewEvidence): Promise<Evidence | null> {
    // Actual file saving to disk should be handled by the API endpoint.
    // This service method just records the metadata, including the file_key (path).
    if (!evidenceData.fileKey) {
        throw new Error("File key (path) is required to create evidence.");
    }
    const result = await db.insert(schema.evidences).values(evidenceData).returning();
    return result[0] || null;
  }

  async updateEvidence(id: number, evidenceData: Partial<NewEvidence>): Promise<Evidence | null> {
    // If fileKey is updated, the API endpoint should handle deletion of the old file
    // and saving of the new file. This service method only updates metadata.
    const result = await db.update(schema.evidences)
      .set({ ...evidenceData, updatedAt: new Date() })
      .where(eq(schema.evidences.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteEvidence(id: number): Promise<{ success: boolean; filePath?: string | null }> {
    // This method deletes the DB record.
    // The API endpoint calling this should handle actual file deletion from disk.
    // We return the filePath so the API endpoint knows what to delete.
    const evidence = await this.getEvidence(id);
    if (!evidence) {
      return { success: false, filePath: null };
    }

    const result = await db.delete(schema.evidences).where(eq(schema.evidences.id, id)).returning();
    return { success: result.length > 0, filePath: evidence.fileKey };
  }

  // --- Data Reset Method ---
  async resetData(): Promise<void> {
    console.log('Resetting database data...');
    // Order of deletion matters due to foreign key constraints
    // Or use CASCADE if defined in schema (Drizzle doesn't directly manage CASCADE for TRUNCATE)
    // Using DELETE FROM for simplicity with Drizzle, TRUNCATE might need raw SQL execution.
    
    await db.delete(schema.evidences);
    console.log('Evidences table cleared.');
    
    await db.delete(schema.inspections);
    console.log('Inspections table cleared.');
    
    await db.delete(schema.projects);
    console.log('Projects table cleared.');
    
    await db.delete(schema.clients);
    console.log('Clients table cleared.');
    
    await db.delete(schema.users); // Delete all users first
    console.log('Users table cleared.');

    // Clear files in the uploads/evidences directory
    try {
      await fs.mkdir(UPLOADS_EVIDENCES_DIR, { recursive: true }); // Ensure directory exists
      const files = await fs.readdir(UPLOADS_EVIDENCES_DIR);
      for (const file of files) {
        await fs.unlink(path.join(UPLOADS_EVIDENCES_DIR, file));
      }
      console.log('Uploaded evidences directory cleared.');
    } catch (error) {
      console.error('Error clearing uploaded evidences directory:', error);
      // Don't let this block the rest of the reset if it fails (e.g., perms issue)
    }

    // Re-create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@brasilit.com.br';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await this.createUser({
      name: 'Administrador Padrão',
      email: adminEmail,
      passwordHash: hashedPassword,
      role: schema.RoleEnum.Admin, // Assuming RoleEnum is defined in your schema
      // id: 'admin-default-id' // If you need a predictable ID and your schema allows it
    });
    console.log(`Default admin user created with email: ${adminEmail}`);
    console.log('Database reset complete.');
  }
}

// Example of how to instantiate and export the service
// This allows for singleton usage or specific DI patterns.
export const storageService = new StorageService();
