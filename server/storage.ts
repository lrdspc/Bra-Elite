import { users, clients, projects, inspections, evidences } from "@shared/schema";
import type { User, InsertUser, Client, InsertClient, Project, InsertProject, Inspection, InsertInspection, Evidence, InsertEvidence } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  
  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  getProjectsByClientId(clientId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  
  // Inspection methods
  getInspection(id: number): Promise<Inspection | undefined>;
  getInspections(): Promise<Inspection[]>;
  getInspectionsByUserId(userId: number): Promise<Inspection[]>;
  getInspectionsByClientId(clientId: number): Promise<Inspection[]>;
  getInspectionsByProjectId(projectId: number): Promise<Inspection[]>;
  getInspectionsByStatus(status: string): Promise<Inspection[]>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: number, inspection: Partial<InsertInspection>): Promise<Inspection | undefined>;
  
  // Evidence methods
  getEvidence(id: number): Promise<Evidence | undefined>;
  getEvidencesByInspectionId(inspectionId: number): Promise<Evidence[]>;
  createEvidence(evidence: InsertEvidence): Promise<Evidence>;
  updateEvidence(id: number, evidence: Partial<InsertEvidence>): Promise<Evidence | undefined>;
  deleteEvidence(id: number): Promise<boolean>;
  
  // System methods
  resetData(): Promise<{users: number, clients: number, projects: number, inspections: number, evidences: number}>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private projects: Map<number, Project>;
  private inspections: Map<number, Inspection>;
  private evidences: Map<number, Evidence>;
  
  private userId: number;
  private clientId: number;
  private projectId: number;
  private inspectionId: number;
  private evidenceId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.projects = new Map();
    this.inspections = new Map();
    this.evidences = new Map();
    
    this.userId = 1;
    this.clientId = 1;
    this.projectId = 1;
    this.inspectionId = 1;
    this.evidenceId = 1;
    
    // Add sample user
    this.createUser({
      username: "tecnico",
      password: "senha123",
      name: "João da Silva",
      email: "joao@brasilit.com",
      role: "technician"
    });
    
    // Add sample clients
    const client1 = this.createUser({
      username: "admin",
      password: "admin123",
      name: "Admin",
      email: "admin@brasilit.com",
      role: "admin"
    });
    
    // Add sample clients
    const client1Id = this.createClient({
      name: "Condomínio Solar das Flores",
      type: "company",
      document: "12.345.678/0001-90",
      contactName: "Pedro Santos",
      contactPhone: "(11) 98765-4321",
      email: "contato@solardasflores.com.br"
    }).id;
    
    const client2Id = this.createClient({
      name: "Residencial Vila Nova",
      type: "company",
      document: "23.456.789/0001-12",
      contactName: "Maria Oliveira",
      contactPhone: "(11) 97654-3210",
      email: "contato@vilanovo.com.br"
    }).id;
    
    const client3Id = this.createClient({
      name: "Escola Municipal Monteiro Lobato",
      type: "company",
      document: "34.567.890/0001-23",
      contactName: "José Pereira",
      contactPhone: "(11) 96543-2109",
      email: "contato@escolamonteiro.edu.br"
    }).id;
    
    // Add sample projects
    const project1Id = this.createProject({
      clientId: client1Id,
      name: "Condomínio Solar das Flores",
      address: "Av. Paulista",
      number: "1000",
      complement: "Bloco A",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-000",
      latitude: "-23.5630",
      longitude: "-46.6543"
    }).id;
    
    const project2Id = this.createProject({
      clientId: client2Id,
      name: "Residencial Vila Nova",
      address: "Rua das Flores",
      number: "123",
      neighborhood: "Centro",
      city: "Campinas",
      state: "SP",
      zipCode: "13010-000",
      latitude: "-22.9064",
      longitude: "-47.0616"
    }).id;
    
    const project3Id = this.createProject({
      clientId: client3Id,
      name: "Escola Municipal Monteiro Lobato",
      address: "Av. Brasil",
      number: "500",
      neighborhood: "Jardim América",
      city: "São Paulo",
      state: "SP",
      zipCode: "01430-000",
      latitude: "-23.5728",
      longitude: "-46.6444"
    }).id;
    
    // Add sample inspections - usar skipValidation=true para ignorar validações durante inicialização
    this.createInspection({
      protocolNumber: "VT-2023-0782",
      userId: 1,
      clientId: client1Id,
      projectId: project1Id,
      status: "completed",
      scheduledDate: new Date("2023-04-22T14:30:00"),
      startTime: new Date("2023-04-22T14:30:00"),
      endTime: new Date("2023-04-22T16:00:00"),
      roofModel: "Telha Ondulada",
      quantity: 250,
      area: 500,
      installationDate: new Date("2021-08-15"),
      warranty: "7",
      conclusion: "Aprovado",
      recommendation: "Manutenção preventiva anual"
    }, true); // Passar skipValidation=true
    
    this.createInspection({
      protocolNumber: "VT-2023-0781",
      userId: 1,
      clientId: client2Id,
      projectId: project2Id,
      status: "in_review",
      scheduledDate: new Date("2023-04-21T09:00:00"),
      startTime: new Date("2023-04-21T09:00:00"),
      endTime: new Date("2023-04-21T10:30:00"),
      roofModel: "Telha Plana",
      quantity: 180,
      area: 350,
      installationDate: new Date("2020-06-10"),
      warranty: "7",
      conclusion: "Pendente revisão",
      recommendation: "Aguardando análise técnica"
    }, true); // Passar skipValidation=true
    
    this.createInspection({
      protocolNumber: "VT-2023-0780",
      userId: 1,
      clientId: client3Id,
      projectId: project3Id,
      status: "in_progress",
      scheduledDate: new Date("2023-04-20T13:00:00"),
      startTime: new Date("2023-04-20T13:00:00"),
      roofModel: "Fibrocimento",
      quantity: 300,
      area: 600,
      installationDate: new Date("2019-12-05"),
      warranty: "5"
    }, true); // Passar skipValidation=true
    
    // Schedule upcoming inspections
    this.createInspection({
      protocolNumber: "VT-2023-0783",
      userId: 1,
      clientId: client1Id,
      projectId: project1Id,
      status: "scheduled",
      scheduledDate: new Date(Date.now() + 3600000), // Today in 1 hour
      roofModel: "Telha Ondulada"
    }, true); // Passar skipValidation=true
    
    this.createInspection({
      protocolNumber: "VT-2023-0784",
      userId: 1,
      clientId: client2Id,
      projectId: project2Id,
      status: "scheduled",
      scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
      roofModel: "Telha Plana"
    }, true); // Passar skipValidation=true
    
    this.createInspection({
      protocolNumber: "VT-2023-0785",
      userId: 1,
      clientId: client3Id,
      projectId: project3Id,
      status: "scheduled",
      scheduledDate: new Date(Date.now() + 86400000 * 4), // In 4 days
      roofModel: "Fibrocimento"
    }, true); // Passar skipValidation=true
    
    // Garantir que todas as inspeções têm os campos clientId e projectId
    console.log("Verificando integridade das inspeções...");
    for (let [id, inspection] of this.inspections.entries()) {
      if (!inspection.clientId || !inspection.projectId) {
        console.warn(`Inspeção ${id} com dados incompletos: faltam clientId ou projectId`);
      }
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
  
  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const client: Client = { 
      ...insertClient, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.clients.set(id, client);
    return client;
  }
  
  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const client = await this.getClient(id);
    if (!client) return undefined;
    
    const updatedClient: Client = {
      ...client,
      ...clientData,
      updatedAt: new Date()
    };
    
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProjectsByClientId(clientId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.clientId === clientId
    );
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const project = await this.getProject(id);
    if (!project) return undefined;
    
    const updatedProject: Project = {
      ...project,
      ...projectData,
      updatedAt: new Date()
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  // Inspection methods
  async getInspection(id: number): Promise<Inspection | undefined> {
    return this.inspections.get(id);
  }
  
  async getInspections(): Promise<Inspection[]> {
    return Array.from(this.inspections.values());
  }
  
  async getInspectionsByUserId(userId: number): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).filter(
      (inspection) => inspection.userId === userId
    );
  }
  
  async getInspectionsByClientId(clientId: number): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).filter(
      (inspection) => inspection.clientId === clientId
    );
  }
  
  async getInspectionsByProjectId(projectId: number): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).filter(
      (inspection) => inspection.projectId === projectId
    );
  }
  
  async getInspectionsByStatus(status: string): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).filter(
      (inspection) => inspection.status === status
    );
  }
  
  async createInspection(insertInspection: InsertInspection, skipValidation: boolean = false): Promise<Inspection> {
    const id = this.inspectionId++;
    
    // Se skipValidation for true, pular verificações (usado para inicialização e reset de dados)
    if (!skipValidation) {
      // Verificar se clientId e projectId estão definidos
      if (!insertInspection.clientId || !insertInspection.projectId) {
        throw new Error("Inspeção deve ter clientId e projectId definidos");
      }
      
      // Verificar se o cliente e o projeto existem
      const clientExists = await this.getClient(insertInspection.clientId);
      const projectExists = await this.getProject(insertInspection.projectId);
      
      if (!clientExists) {
        throw new Error(`Cliente com ID ${insertInspection.clientId} não encontrado`);
      }
      
      if (!projectExists) {
        throw new Error(`Projeto com ID ${insertInspection.projectId} não encontrado`);
      }
    }
    
    const inspection: Inspection = {
      ...insertInspection,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Registrar criação com fins de depuração
    if (inspection.clientId && inspection.projectId) {
      console.log(`Criando inspeção ${id} com clientId=${inspection.clientId}, projectId=${inspection.projectId}`);
    } else {
      console.log(`Criando inspeção ${id} (sem clientId ou projectId - modo inicialização)`);
    }
    
    this.inspections.set(id, inspection);
    return inspection;
  }
  
  async updateInspection(id: number, inspectionData: Partial<InsertInspection>): Promise<Inspection | undefined> {
    const inspection = await this.getInspection(id);
    if (!inspection) return undefined;
    
    // Verificar se está tentando alterar clientId
    if (inspectionData.clientId !== undefined && inspectionData.clientId !== inspection.clientId) {
      // Verificar se o novo clientId existe
      const clientExists = await this.getClient(inspectionData.clientId);
      if (!clientExists) {
        throw new Error(`Cliente com ID ${inspectionData.clientId} não encontrado`);
      }
    }
    
    // Verificar se está tentando alterar projectId
    if (inspectionData.projectId !== undefined && inspectionData.projectId !== inspection.projectId) {
      // Verificar se o novo projectId existe
      const projectExists = await this.getProject(inspectionData.projectId);
      if (!projectExists) {
        throw new Error(`Projeto com ID ${inspectionData.projectId} não encontrado`);
      }
    }
    
    const updatedInspection: Inspection = {
      ...inspection,
      ...inspectionData,
      updatedAt: new Date()
    };
    
    // Garantir que os IDs de relacionamento estejam sempre presentes
    if (!updatedInspection.clientId || !updatedInspection.projectId) {
      throw new Error("Inspeção deve manter clientId e projectId definidos");
    }
    
    // Registrar atualização com fins de depuração
    console.log(`Atualizando inspeção ${id}: clientId=${updatedInspection.clientId}, projectId=${updatedInspection.projectId}`);
    
    this.inspections.set(id, updatedInspection);
    return updatedInspection;
  }
  
  // Evidence methods
  async getEvidence(id: number): Promise<Evidence | undefined> {
    return this.evidences.get(id);
  }
  
  async getEvidencesByInspectionId(inspectionId: number): Promise<Evidence[]> {
    return Array.from(this.evidences.values()).filter(
      (evidence) => evidence.inspectionId === inspectionId
    );
  }
  
  async createEvidence(insertEvidence: InsertEvidence): Promise<Evidence> {
    const id = this.evidenceId++;
    const evidence: Evidence = {
      ...insertEvidence,
      id,
      createdAt: new Date()
    };
    this.evidences.set(id, evidence);
    return evidence;
  }
  
  async updateEvidence(id: number, evidenceData: Partial<InsertEvidence>): Promise<Evidence | undefined> {
    const evidence = await this.getEvidence(id);
    if (!evidence) return undefined;
    
    const updatedEvidence: Evidence = {
      ...evidence,
      ...evidenceData
    };
    
    this.evidences.set(id, updatedEvidence);
    return updatedEvidence;
  }
  
  async deleteEvidence(id: number): Promise<boolean> {
    return this.evidences.delete(id);
  }
  
  // System methods
  async resetData(): Promise<{users: number, clients: number, projects: number, inspections: number, evidences: number}> {
    // Limpar todos os dados atuais
    this.users.clear();
    this.clients.clear();
    this.projects.clear();
    this.inspections.clear();
    this.evidences.clear();
    
    // Resetar os contadores de IDs
    this.userId = 1;
    this.clientId = 1;
    this.projectId = 1;
    this.inspectionId = 1;
    this.evidenceId = 1;
    
    // Recriar dados iniciais
    // Usuário técnico inicial
    this.createUser({
      username: "tecnico",
      password: "senha123",
      name: "João da Silva",
      email: "joao@brasilit.com",
      role: "technician"
    });
    
    // Usuário administrador
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Admin",
      email: "admin@brasilit.com",
      role: "admin"
    });
    
    // Clientes - Salvar como objetos diretamente
    const client1 = this.createClient({
      name: "Condomínio Solar das Flores",
      type: "company",
      document: "12.345.678/0001-90",
      contactName: "Pedro Santos",
      contactPhone: "(11) 98765-4321",
      email: "contato@solardasflores.com.br"
    });
    
    const client2 = this.createClient({
      name: "Residencial Vila Nova",
      type: "company",
      document: "23.456.789/0001-12",
      contactName: "Maria Oliveira",
      contactPhone: "(11) 97654-3210",
      email: "contato@vilanovo.com.br"
    });
    
    const client3 = this.createClient({
      name: "Escola Municipal Monteiro Lobato",
      type: "company",
      document: "34.567.890/0001-23",
      contactName: "José Pereira",
      contactPhone: "(11) 96543-2109",
      email: "contato@escolamonteiro.edu.br"
    });
    
    // Aguardar resolução das promessas para obter os IDs dos clientes
    const client1Id = 1;
    const client2Id = 2;
    const client3Id = 3;
    
    // Projetos - Salvar como objetos diretamente
    const project1 = this.createProject({
      clientId: client1Id,
      name: "Condomínio Solar das Flores",
      address: "Av. Paulista",
      number: "1000",
      complement: "Bloco A",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-000",
      latitude: "-23.5630",
      longitude: "-46.6543"
    });
    
    const project2 = this.createProject({
      clientId: client2Id,
      name: "Residencial Vila Nova",
      address: "Rua das Flores",
      number: "123",
      neighborhood: "Centro",
      city: "Campinas",
      state: "SP",
      zipCode: "13010-000",
      latitude: "-22.9064",
      longitude: "-47.0616"
    });
    
    const project3 = this.createProject({
      clientId: client3Id,
      name: "Escola Municipal Monteiro Lobato",
      address: "Av. Brasil",
      number: "500",
      neighborhood: "Jardim América",
      city: "São Paulo",
      state: "SP",
      zipCode: "01430-000",
      latitude: "-23.5728",
      longitude: "-46.6444"
    });
    
    // Aguardar resolução das promessas para obter os IDs dos projetos
    const project1Id = 1;
    const project2Id = 2;
    const project3Id = 3;
    
    // Função auxiliar para criar inspeção com clientId e projectId explícitos
    const createInspectionWithRelations = (data: any) => {
      // Criar a inspeção diretamente usando this.inspections.set
      const id = this.inspectionId++;
      const inspection: Inspection = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Garantir que clientId e projectId estejam definidos
      console.log(`Criando inspeção ${id} com clientId=${inspection.clientId}, projectId=${inspection.projectId}`);
      
      this.inspections.set(id, inspection);
      return inspection;
    };
    
    // Inspeções
    createInspectionWithRelations({
      protocolNumber: "VT-2023-0782",
      userId: 1,
      clientId: client1Id,
      projectId: project1Id,
      status: "completed",
      scheduledDate: new Date("2023-04-22T14:30:00"),
      startTime: new Date("2023-04-22T14:30:00"),
      endTime: new Date("2023-04-22T16:00:00"),
      roofModel: "Telha Ondulada",
      quantity: 250,
      area: 500,
      installationDate: new Date("2021-08-15"),
      warranty: "7",
      conclusion: "Aprovado",
      recommendation: "Manutenção preventiva anual"
    });
    
    createInspectionWithRelations({
      protocolNumber: "VT-2023-0781",
      userId: 1,
      clientId: client2Id,
      projectId: project2Id,
      status: "in_review",
      scheduledDate: new Date("2023-04-21T09:00:00"),
      startTime: new Date("2023-04-21T09:00:00"),
      endTime: new Date("2023-04-21T10:30:00"),
      roofModel: "Telha Plana",
      quantity: 180,
      area: 350,
      installationDate: new Date("2020-06-10"),
      warranty: "7",
      conclusion: "Pendente revisão",
      recommendation: "Aguardando análise técnica"
    });
    
    createInspectionWithRelations({
      protocolNumber: "VT-2023-0780",
      userId: 1,
      clientId: client3Id,
      projectId: project3Id,
      status: "in_progress",
      scheduledDate: new Date("2023-04-20T13:00:00"),
      startTime: new Date("2023-04-20T13:00:00"),
      roofModel: "Fibrocimento",
      quantity: 300,
      area: 600,
      installationDate: new Date("2019-12-05"),
      warranty: "5"
    });
    
    // Inspeções agendadas
    createInspectionWithRelations({
      protocolNumber: "VT-2023-0783",
      userId: 1,
      clientId: client1Id,
      projectId: project1Id,
      status: "scheduled",
      scheduledDate: new Date(Date.now() + 3600000), // Hoje em 1 hora
      roofModel: "Telha Ondulada"
    });
    
    createInspectionWithRelations({
      protocolNumber: "VT-2023-0784",
      userId: 1,
      clientId: client2Id,
      projectId: project2Id,
      status: "scheduled",
      scheduledDate: new Date(Date.now() + 86400000), // Amanhã
      roofModel: "Telha Plana"
    });
    
    createInspectionWithRelations({
      protocolNumber: "VT-2023-0785",
      userId: 1,
      clientId: client3Id,
      projectId: project3Id,
      status: "scheduled",
      scheduledDate: new Date(Date.now() + 86400000 * 4), // Em 4 dias
      roofModel: "Fibrocimento"
    });
    
    // Verificar integridade
    console.log("Verificando integridade das inspeções após resetData...");
    for (let [id, inspection] of this.inspections.entries()) {
      console.log(`Inspeção ${id}: clientId=${inspection.clientId}, projectId=${inspection.projectId}`);
    }
    
    return {
      users: this.users.size,
      clients: this.clients.size,
      projects: this.projects.size,
      inspections: this.inspections.size,
      evidences: this.evidences.size
    };
  }
}

export const storage = new MemStorage();
