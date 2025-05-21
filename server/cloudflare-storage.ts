import { users, clients, projects, inspections, evidences } from "@shared/schema";
import type { User, InsertUser, Client, InsertClient, Project, InsertProject, Inspection, InsertInspection, Evidence, InsertEvidence } from "@shared/schema";
import { IStorage } from "./storage";
import { eq, and } from "drizzle-orm";

export interface CloudflareEnv {
  DB: D1Database;
  KV_STORE: KVNamespace;
  R2_BUCKET?: R2Bucket;
}

export class CloudflareStorage implements IStorage {
  private env: CloudflareEnv;

  constructor(env: CloudflareEnv) {
    this.env = env;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.env.DB.prepare(
      `SELECT * FROM users WHERE id = ?`
    ).bind(id).first<User>();
    return result || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.env.DB.prepare(
      `SELECT * FROM users WHERE username = ?`
    ).bind(username).first<User>();
    return result || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const stmt = this.env.DB.prepare(
      `INSERT INTO users (username, password, name, email, role, avatar) 
       VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(
      user.username,
      user.password,
      user.name,
      user.email,
      user.role || "technician",
      user.avatar || null
    );

    const result = await stmt.first<User>();
    if (!result) {
      throw new Error("Falha ao criar usuário");
    }
    return result;
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    const result = await this.env.DB.prepare(
      `SELECT * FROM clients WHERE id = ?`
    ).bind(id).first<Client>();
    return result || undefined;
  }

  async getClients(): Promise<Client[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM clients ORDER BY name`
    ).all<Client>();
    return results;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const stmt = this.env.DB.prepare(
      `INSERT INTO clients (name, type, document, contact_name, contact_phone, email) 
       VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(
      client.name,
      client.type,
      client.document || null,
      client.contactName || null,
      client.contactPhone || null,
      client.email || null
    );

    const result = await stmt.first<Client>();
    if (!result) {
      throw new Error("Falha ao criar cliente");
    }
    return result;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    // Primeiro verificamos se o cliente existe
    const existingClient = await this.getClient(id);
    if (!existingClient) return undefined;

    // Construímos dinamicamente a query de atualização
    let query = "UPDATE clients SET ";
    const updates: string[] = [];
    const values: any[] = [];

    if (client.name !== undefined) {
      updates.push("name = ?");
      values.push(client.name);
    }
    if (client.type !== undefined) {
      updates.push("type = ?");
      values.push(client.type);
    }
    if (client.document !== undefined) {
      updates.push("document = ?");
      values.push(client.document);
    }
    if (client.contactName !== undefined) {
      updates.push("contact_name = ?");
      values.push(client.contactName);
    }
    if (client.contactPhone !== undefined) {
      updates.push("contact_phone = ?");
      values.push(client.contactPhone);
    }
    if (client.email !== undefined) {
      updates.push("email = ?");
      values.push(client.email);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    query += updates.join(", ");
    query += " WHERE id = ? RETURNING *";
    values.push(id);

    const stmt = this.env.DB.prepare(query).bind(...values);
    const result = await stmt.first<Client>();
    return result || undefined;
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    const result = await this.env.DB.prepare(
      `SELECT * FROM projects WHERE id = ?`
    ).bind(id).first<Project>();
    return result || undefined;
  }

  async getProjects(): Promise<Project[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM projects ORDER BY name`
    ).all<Project>();
    return results;
  }

  async getProjectsByClientId(clientId: number): Promise<Project[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM projects WHERE client_id = ? ORDER BY name`
    ).bind(clientId).all<Project>();
    return results;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const stmt = this.env.DB.prepare(
      `INSERT INTO projects (
        client_id, name, address, number, complement, neighborhood, 
        city, state, zip_code, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(
      project.clientId,
      project.name,
      project.address,
      project.number || null,
      project.complement || null,
      project.neighborhood || null,
      project.city,
      project.state,
      project.zipCode || null,
      project.latitude || null,
      project.longitude || null
    );

    const result = await stmt.first<Project>();
    if (!result) {
      throw new Error("Falha ao criar projeto");
    }
    return result;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    // Primeiro verificamos se o projeto existe
    const existingProject = await this.getProject(id);
    if (!existingProject) return undefined;

    // Construímos dinamicamente a query de atualização
    let query = "UPDATE projects SET ";
    const updates: string[] = [];
    const values: any[] = [];

    if (project.clientId !== undefined) {
      updates.push("client_id = ?");
      values.push(project.clientId);
    }
    if (project.name !== undefined) {
      updates.push("name = ?");
      values.push(project.name);
    }
    if (project.address !== undefined) {
      updates.push("address = ?");
      values.push(project.address);
    }
    if (project.number !== undefined) {
      updates.push("number = ?");
      values.push(project.number);
    }
    if (project.complement !== undefined) {
      updates.push("complement = ?");
      values.push(project.complement);
    }
    if (project.neighborhood !== undefined) {
      updates.push("neighborhood = ?");
      values.push(project.neighborhood);
    }
    if (project.city !== undefined) {
      updates.push("city = ?");
      values.push(project.city);
    }
    if (project.state !== undefined) {
      updates.push("state = ?");
      values.push(project.state);
    }
    if (project.zipCode !== undefined) {
      updates.push("zip_code = ?");
      values.push(project.zipCode);
    }
    if (project.latitude !== undefined) {
      updates.push("latitude = ?");
      values.push(project.latitude);
    }
    if (project.longitude !== undefined) {
      updates.push("longitude = ?");
      values.push(project.longitude);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    query += updates.join(", ");
    query += " WHERE id = ? RETURNING *";
    values.push(id);

    const stmt = this.env.DB.prepare(query).bind(...values);
    const result = await stmt.first<Project>();
    return result || undefined;
  }

  // Inspection methods
  async getInspection(id: number): Promise<Inspection | undefined> {
    const result = await this.env.DB.prepare(
      `SELECT * FROM inspections WHERE id = ?`
    ).bind(id).first<Inspection>();
    return result || undefined;
  }

  async getInspections(): Promise<Inspection[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM inspections ORDER BY scheduled_date DESC`
    ).all<Inspection>();
    return results;
  }

  async getInspectionsByUserId(userId: number): Promise<Inspection[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM inspections WHERE user_id = ? ORDER BY scheduled_date DESC`
    ).bind(userId).all<Inspection>();
    return results;
  }

  async getInspectionsByClientId(clientId: number): Promise<Inspection[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM inspections WHERE client_id = ? ORDER BY scheduled_date DESC`
    ).bind(clientId).all<Inspection>();
    return results;
  }

  async getInspectionsByProjectId(projectId: number): Promise<Inspection[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM inspections WHERE project_id = ? ORDER BY scheduled_date DESC`
    ).bind(projectId).all<Inspection>();
    return results;
  }

  async getInspectionsByStatus(status: string): Promise<Inspection[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM inspections WHERE status = ? ORDER BY scheduled_date DESC`
    ).bind(status).all<Inspection>();
    return results;
  }

  async createInspection(inspection: InsertInspection, skipValidation: boolean = false): Promise<Inspection> {
    // Validação
    if (!skipValidation) {
      if (!inspection.clientId || !inspection.projectId) {
        throw new Error("Inspeção deve ter clientId e projectId definidos");
      }

      const clientExists = await this.getClient(inspection.clientId);
      const projectExists = await this.getProject(inspection.projectId);

      if (!clientExists) {
        throw new Error(`Cliente com ID ${inspection.clientId} não encontrado`);
      }

      if (!projectExists) {
        throw new Error(`Projeto com ID ${inspection.projectId} não encontrado`);
      }
    }

    // Se technical_analysis for um objeto, convertemos para JSON string
    let technicalAnalysis = inspection.technicalAnalysis;
    if (technicalAnalysis && typeof technicalAnalysis === 'object') {
      technicalAnalysis = JSON.stringify(technicalAnalysis);
    }

    const stmt = this.env.DB.prepare(`
      INSERT INTO inspections (
        protocol_number, user_id, client_id, project_id, status, 
        scheduled_date, start_time, end_time, roof_model, quantity, 
        area, installation_date, warranty, invoice, technical_analysis, 
        conclusion, recommendation, signature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *
    `).bind(
      inspection.protocolNumber,
      inspection.userId,
      inspection.clientId,
      inspection.projectId,
      inspection.status || "draft",
      inspection.scheduledDate ? new Date(inspection.scheduledDate).toISOString() : null,
      inspection.startTime ? new Date(inspection.startTime).toISOString() : null,
      inspection.endTime ? new Date(inspection.endTime).toISOString() : null,
      inspection.roofModel || null,
      inspection.quantity || null,
      inspection.area || null,
      inspection.installationDate ? new Date(inspection.installationDate).toISOString() : null,
      inspection.warranty || null,
      inspection.invoice || null,
      technicalAnalysis || null,
      inspection.conclusion || null,
      inspection.recommendation || null,
      inspection.signature || null
    );

    const result = await stmt.first<Inspection>();
    if (!result) {
      throw new Error("Falha ao criar inspeção");
    }
    return result;
  }

  async updateInspection(id: number, inspection: Partial<InsertInspection>): Promise<Inspection | undefined> {
    // Primeiro verificamos se a inspeção existe
    const existingInspection = await this.getInspection(id);
    if (!existingInspection) return undefined;

    // Construímos dinamicamente a query de atualização
    let query = "UPDATE inspections SET ";
    const updates: string[] = [];
    const values: any[] = [];

    if (inspection.userId !== undefined) {
      updates.push("user_id = ?");
      values.push(inspection.userId);
    }
    if (inspection.clientId !== undefined) {
      updates.push("client_id = ?");
      values.push(inspection.clientId);
    }
    if (inspection.projectId !== undefined) {
      updates.push("project_id = ?");
      values.push(inspection.projectId);
    }
    if (inspection.status !== undefined) {
      updates.push("status = ?");
      values.push(inspection.status);
    }
    if (inspection.protocolNumber !== undefined) {
      updates.push("protocol_number = ?");
      values.push(inspection.protocolNumber);
    }
    if (inspection.scheduledDate !== undefined) {
      updates.push("scheduled_date = ?");
      values.push(inspection.scheduledDate ? new Date(inspection.scheduledDate).toISOString() : null);
    }
    if (inspection.startTime !== undefined) {
      updates.push("start_time = ?");
      values.push(inspection.startTime ? new Date(inspection.startTime).toISOString() : null);
    }
    if (inspection.endTime !== undefined) {
      updates.push("end_time = ?");
      values.push(inspection.endTime ? new Date(inspection.endTime).toISOString() : null);
    }
    if (inspection.roofModel !== undefined) {
      updates.push("roof_model = ?");
      values.push(inspection.roofModel);
    }
    if (inspection.quantity !== undefined) {
      updates.push("quantity = ?");
      values.push(inspection.quantity);
    }
    if (inspection.area !== undefined) {
      updates.push("area = ?");
      values.push(inspection.area);
    }
    if (inspection.installationDate !== undefined) {
      updates.push("installation_date = ?");
      values.push(inspection.installationDate ? new Date(inspection.installationDate).toISOString() : null);
    }
    if (inspection.warranty !== undefined) {
      updates.push("warranty = ?");
      values.push(inspection.warranty);
    }
    if (inspection.invoice !== undefined) {
      updates.push("invoice = ?");
      values.push(inspection.invoice);
    }
    
    // Se technical_analysis for um objeto, convertemos para JSON string
    if (inspection.technicalAnalysis !== undefined) {
      updates.push("technical_analysis = ?");
      let technicalAnalysis = inspection.technicalAnalysis;
      if (technicalAnalysis && typeof technicalAnalysis === 'object') {
        technicalAnalysis = JSON.stringify(technicalAnalysis);
      }
      values.push(technicalAnalysis);
    }
    
    if (inspection.conclusion !== undefined) {
      updates.push("conclusion = ?");
      values.push(inspection.conclusion);
    }
    if (inspection.recommendation !== undefined) {
      updates.push("recommendation = ?");
      values.push(inspection.recommendation);
    }
    if (inspection.signature !== undefined) {
      updates.push("signature = ?");
      values.push(inspection.signature);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    query += updates.join(", ");
    query += " WHERE id = ? RETURNING *";
    values.push(id);

    const stmt = this.env.DB.prepare(query).bind(...values);
    const result = await stmt.first<Inspection>();
    return result || undefined;
  }
  
  // Evidence methods
  async getEvidence(id: number): Promise<Evidence | undefined> {
    const result = await this.env.DB.prepare(
      `SELECT * FROM evidences WHERE id = ?`
    ).bind(id).first<Evidence>();
    return result || undefined;
  }

  async getEvidencesByInspectionId(inspectionId: number): Promise<Evidence[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM evidences WHERE inspection_id = ? ORDER BY created_at DESC`
    ).bind(inspectionId).all<Evidence>();
    return results;
  }

  async createEvidence(evidence: InsertEvidence): Promise<Evidence> {
    // Se o arquivo estiver presente como base64, armazenamos no R2
    let fileKey = null;
    if (evidence.file && this.env.R2_BUCKET) {
      // Gerar um nome de arquivo único usando timestamp e uuid aleatório
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10);
      fileKey = `evidences/${evidence.inspectionId}/${timestamp}-${randomId}`;
      
      try {
        // Verificar se a string é base64
        if (evidence.file.startsWith('data:')) {
          // Extrair o tipo de mídia e os dados base64
          const matches = evidence.file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const contentType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Armazenar o arquivo no R2
            await this.env.R2_BUCKET.put(fileKey, buffer, {
              contentType: contentType
            });
          } else {
            throw new Error("Formato de arquivo inválido");
          }
        } else {
          throw new Error("Formato de arquivo inválido");
        }
      } catch (error) {
        console.error("Erro ao salvar arquivo no R2:", error);
        throw new Error("Falha ao armazenar o arquivo");
      }
    }

    // Se description for um objeto, convertemos para JSON string
    let description = evidence.description;
    if (description && typeof description === 'object') {
      description = JSON.stringify(description);
    }

    const stmt = this.env.DB.prepare(`
      INSERT INTO evidences (inspection_id, type, title, description, file_key, coordinates) 
      VALUES (?, ?, ?, ?, ?, ?) RETURNING *
    `).bind(
      evidence.inspectionId,
      evidence.type || "photo",
      evidence.title || null,
      description || null,
      fileKey || null,
      evidence.coordinates || null
    );

    const result = await stmt.first<Evidence>();
    if (!result) {
      throw new Error("Falha ao criar evidência");
    }
    return result;
  }

  async updateEvidence(id: number, evidence: Partial<InsertEvidence>): Promise<Evidence | undefined> {
    // Primeiro verificamos se a evidência existe
    const existingEvidence = await this.getEvidence(id);
    if (!existingEvidence) return undefined;

    // Se houver novo arquivo, primeiro excluímos o arquivo antigo do R2 e depois adicionamos o novo
    let fileKey = existingEvidence.fileKey;
    
    if (evidence.file && this.env.R2_BUCKET) {
      // Excluir o arquivo antigo se existir
      if (existingEvidence.fileKey) {
        try {
          await this.env.R2_BUCKET.delete(existingEvidence.fileKey);
        } catch (error) {
          console.error("Erro ao excluir arquivo antigo no R2:", error);
        }
      }

      // Gerar um nome de arquivo único para o novo arquivo
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10);
      fileKey = `evidences/${existingEvidence.inspectionId}/${timestamp}-${randomId}`;
      
      try {
        // Verificar se a string é base64
        if (evidence.file.startsWith('data:')) {
          // Extrair o tipo de mídia e os dados base64
          const matches = evidence.file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const contentType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Armazenar o arquivo no R2
            await this.env.R2_BUCKET.put(fileKey, buffer, {
              contentType: contentType
            });
          } else {
            throw new Error("Formato de arquivo inválido");
          }
        } else {
          throw new Error("Formato de arquivo inválido");
        }
      } catch (error) {
        console.error("Erro ao salvar arquivo no R2:", error);
        throw new Error("Falha ao armazenar o arquivo");
      }
    }

    // Construímos dinamicamente a query de atualização
    let query = "UPDATE evidences SET ";
    const updates: string[] = [];
    const values: any[] = [];

    if (evidence.inspectionId !== undefined) {
      updates.push("inspection_id = ?");
      values.push(evidence.inspectionId);
    }
    if (evidence.type !== undefined) {
      updates.push("type = ?");
      values.push(evidence.type);
    }
    if (evidence.title !== undefined) {
      updates.push("title = ?");
      values.push(evidence.title);
    }
    if (evidence.description !== undefined) {
      updates.push("description = ?");
      let description = evidence.description;
      if (description && typeof description === 'object') {
        description = JSON.stringify(description);
      }
      values.push(description);
    }
    if (evidence.file !== undefined) {
      updates.push("file_key = ?");
      values.push(fileKey);
    }
    if (evidence.coordinates !== undefined) {
      updates.push("coordinates = ?");
      values.push(evidence.coordinates);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    query += updates.join(", ");
    query += " WHERE id = ? RETURNING *";
    values.push(id);

    const stmt = this.env.DB.prepare(query).bind(...values);
    const result = await stmt.first<Evidence>();
    return result || undefined;
  }

  async deleteEvidence(id: number): Promise<boolean> {
    // Primeiro verificamos se a evidência existe
    const evidence = await this.getEvidence(id);
    if (!evidence) return false;

    // Se houver arquivo, excluímos do R2
    if (evidence.fileKey && this.env.R2_BUCKET) {
      try {
        await this.env.R2_BUCKET.delete(evidence.fileKey);
      } catch (error) {
        console.error("Erro ao excluir arquivo no R2:", error);
        // Continuamos com a exclusão do registro mesmo se a exclusão do arquivo falhar
      }
    }

    // Excluir o registro do banco de dados
    const result = await this.env.DB.prepare(
      `DELETE FROM evidences WHERE id = ?`
    ).bind(id).run();

    return result.success;
  }

  // System methods
  async resetData(): Promise<{ users: number, clients: number, projects: number, inspections: number, evidences: number }> {
    // Primeiro, excluímos todos os arquivos de evidências do R2
    if (this.env.R2_BUCKET) {
      try {
        // Listar todos os objetos no bucket com prefixo 'evidences/'
        const objects = await this.env.R2_BUCKET.list({ prefix: 'evidences/' });
        
        // Excluir cada objeto encontrado
        for (const object of objects.objects) {
          await this.env.R2_BUCKET.delete(object.key);
        }
      } catch (error) {
        console.error("Erro ao limpar arquivos do R2:", error);
        // Continuamos mesmo se houver falha na exclusão dos arquivos
      }
    }

    // Redefinir todas as tabelas no banco de dados
    // Usamos transações para garantir a atomicidade
    const tx = this.env.DB.batch();
    
    // Limpar todas as tabelas
    tx.add(`DELETE FROM evidences`);
    tx.add(`DELETE FROM inspections`);
    tx.add(`DELETE FROM projects`);
    tx.add(`DELETE FROM clients`);
    tx.add(`DELETE FROM users`);
    
    // Execute a transação para limpar os dados
    await tx.run();
    
    // Reiniciar os contadores de auto-incremento (se necessário e suportado pelo D1)
    // Nota: O D1 pode não suportar redefinição de sequência diretamente
    
    // Adicionar um usuário admin padrão para garantir acesso ao sistema
    const adminUser = await this.createUser({
      username: "admin",
      password: "admin123", // Em produção, usar senha aleatória ou processo seguro
      name: "Administrador",
      email: "admin@braelite.com.br",
      role: "admin"
    });
    
    // Contar registros em cada tabela após a redefinição
    const userCount = (await this.env.DB.prepare("SELECT COUNT(*) as count FROM users").first<{count: number}>()).count;
    const clientCount = (await this.env.DB.prepare("SELECT COUNT(*) as count FROM clients").first<{count: number}>()).count;
    const projectCount = (await this.env.DB.prepare("SELECT COUNT(*) as count FROM projects").first<{count: number}>()).count;
    const inspectionCount = (await this.env.DB.prepare("SELECT COUNT(*) as count FROM inspections").first<{count: number}>()).count;
    const evidenceCount = (await this.env.DB.prepare("SELECT COUNT(*) as count FROM evidences").first<{count: number}>()).count;
    
    return {
      users: userCount,
      clients: clientCount,
      projects: projectCount,
      inspections: inspectionCount,
      evidences: evidenceCount
    };
  }