// Define the structure for user data, client data, etc. based on your schema
// These are just examples, align them with your actual schema in shared/schema.ts
// It's often good to have types for insert and select operations separately if they differ.

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
} from '@/shared/schema'; // Assuming schema.ts exports these types

export interface UserFilters {
  username?: string;
  email?: string;
}

export interface ClientFilters {
  name?: string;
  document?: string;
}

export interface ProjectFilters {
  clientId?: number; // Assuming client ID is a number
  name?: string;
}

export interface InspectionFilters {
  userId?: string;
  clientId?: number;
  projectId?: number;
  status?: string; // Assuming status is a string like 'pending', 'completed'
  // Add other relevant filters like date ranges, etc.
}

export interface IStorage {
  // User Methods
  getUser(id: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>; // Or by email, if username is email
  createUser(userData: NewUser): Promise<User | null>;
  // updateUser(id: string, userData: Partial<NewUser>): Promise<User | null>; // Optional

  // Client Methods
  getClient(id: number): Promise<Client | null>;
  getClients(filters?: ClientFilters): Promise<Client[]>;
  createClient(clientData: NewClient): Promise<Client | null>;
  updateClient(id: number, clientData: Partial<NewClient>): Promise<Client | null>;

  // Project Methods
  getProject(id: number): Promise<Project | null>;
  getProjects(filters?: ProjectFilters): Promise<Project[]>;
  // getProjectsByClientId(clientId: number): Promise<Project[]>; // Covered by getProjects with filter
  createProject(projectData: NewProject): Promise<Project | null>;
  updateProject(id: number, projectData: Partial<NewProject>): Promise<Project | null>;

  // Inspection Methods
  getInspection(id: number): Promise<Inspection | null>;
  getInspections(filters?: InspectionFilters): Promise<Inspection[]>;
  // getInspectionsByUserId(userId: string): Promise<Inspection[]>; // Covered by getInspections
  // getInspectionsByClientId(clientId: number): Promise<Inspection[]>; // Covered by getInspections
  // getInspectionsByProjectId(projectId: number): Promise<Inspection[]>; // Covered by getInspections
  // getInspectionsByStatus(status: string): Promise<Inspection[]>; // Covered by getInspections
  createInspection(inspectionData: NewInspection): Promise<Inspection | null>;
  updateInspection(id: number, inspectionData: Partial<NewInspection>): Promise<Inspection | null>;

  // Evidence Methods
  getEvidence(id: number): Promise<Evidence | null>;
  getEvidencesByInspectionId(inspectionId: number): Promise<Evidence[]>;
  createEvidence(evidenceData: NewEvidence): Promise<Evidence | null>; // file_key will be a path
  updateEvidence(id: number, evidenceData: Partial<NewEvidence>): Promise<Evidence | null>;
  deleteEvidence(id: number): Promise<{ success: boolean; filePath?: string | null }>; // Return filePath for file deletion

  // Data Reset Method
  resetData(): Promise<void>;
}
