import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertClientSchema, insertProjectSchema, insertInspectionSchema, insertEvidenceSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

// Função para verificar a integridade dos dados
async function verificarIntegridadeDados() {
  console.log("Verificando integridade dos dados...");
  
  // Verificar integridade das inspeções (garantir que clientId e projectId existam)
  const inspections = await storage.getInspections();
  let temProblemas = false;
  let inspectionIds = [];
  
  for (const inspection of inspections) {
    // Verificar se os IDs de relacionamento existem
    if (!inspection.clientId || !inspection.projectId) {
      console.error(`Problema de integridade: Inspeção ${inspection.id} não tem clientId e/ou projectId`);
      inspectionIds.push(inspection.id);
      temProblemas = true;
    } else {
      // Verificar se os IDs de relacionamento são válidos
      const client = await storage.getClient(inspection.clientId);
      const project = await storage.getProject(inspection.projectId);
      
      if (!client) {
        console.error(`Problema de integridade: Inspeção ${inspection.id} tem clientId ${inspection.clientId} que não existe`);
        temProblemas = true;
      }
      
      if (!project) {
        console.error(`Problema de integridade: Inspeção ${inspection.id} tem projectId ${inspection.projectId} que não existe`);
        temProblemas = true;
      }
    }
  }
  
  if (temProblemas) {
    console.warn("Foram encontrados problemas de integridade. Redefinindo os dados...");
    await storage.resetData();
    console.log("Dados redefinidos com sucesso.");
  } else {
    console.log("Verificação de integridade concluída. Nenhum problema encontrado.");
  }
}

// Extende a interface SessionData para incluir o usuário de demonstração
declare module 'express-session' {
  interface SessionData {
    demoUser?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Verificar a integridade dos dados no início do servidor
  await verificarIntegridadeDados();
  
  // Session setup
  const MemoryStoreSession = MemoryStore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "brasilit-vistorias-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // 24 hours
      })
    })
  );
  
  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (user.password !== password) { // Note: In a real app, use bcrypt to compare
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Usuários de demonstração para verificação de sessão pelo frontend
  const demoUsers = [
    {
      id: 1,
      username: 'tecnico',
      name: 'João da Silva',
      email: 'joao.silva@brasilit.com.br',
      role: 'tecnico',
      avatar: '/avatars/tecnico.png'
    },
    {
      id: 2,
      username: 'gestor',
      name: 'Maria Souza',
      email: 'maria.souza@brasilit.com.br',
      role: 'gestor',
      avatar: '/avatars/gestor.png'
    },
    {
      id: 3,
      username: 'admin',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@brasilit.com.br',
      role: 'admin',
      avatar: '/avatars/admin.png'
    }
  ];

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    // TEMPORÁRIO: Desativar autenticação para testes
    return next();
    
    // Código original comentado para testes
    /*
    // Verificar se é um usuário de demonstração
    if (req.session.demoUser) {
      return next();
    }
    
    // Verificar autenticação normal
    if (req.isAuthenticated()) {
      return next();
    }
    
    res.status(401).json({ message: "Unauthorized" });
    */
  };
  
  // Auth routes
  app.post("/api/auth/login", (req, res, next) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Verificar se é um login de demonstração
      const demoUser = demoUsers.find(user => 
        user.username === username && password === '123456'
      );
      
      if (demoUser) {
        // Se for um usuário de demonstração, armazena na sessão e retorna os dados
        req.session.demoUser = demoUser.username;
        return res.json(demoUser);
      }
      
      // Se não for usuário de demonstração, tenta autenticação normal
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message || "Authentication failed" });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json({
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    // Remover usuário de demonstração da sessão, se existir
    if (req.session.demoUser) {
      delete req.session.demoUser;
    }
    
    // Logout normal do passport
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/session", (req, res) => {
    // TEMPORÁRIO: Retornar sempre um usuário técnico para testes
    return res.json({
      id: 1,
      username: 'tecnico',
      name: 'João da Silva',
      email: 'joao.silva@brasilit.com.br',
      role: 'tecnico',
      avatar: '/avatars/tecnico.png'
    });
    
    // Código original comentado para testes
    /*
    // Check for demo user in the session
    const sessionUser = req.session.demoUser;
    if (sessionUser) {
      // Se há um usuário de demonstração na sessão, retorna seus dados
      const demoUser = demoUsers.find(u => u.username === sessionUser);
      if (demoUser) {
        return res.json(demoUser);
      }
    }
    
    // Se não há usuário de demonstração, verifica autenticação normal
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      });
    }
    
    // Nenhuma autenticação encontrada
    res.status(401).json({ message: "Not authenticated" });
    */
  });
  
  // Client routes
  app.get("/api/clients", isAuthenticated, async (req, res, next) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/clients/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/clients", isAuthenticated, async (req, res, next) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });
  
  app.patch("/api/clients/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });
  
  // Project routes
  app.get("/api/projects", isAuthenticated, async (req, res, next) => {
    try {
      const { clientId } = req.query;
      
      if (clientId && typeof clientId === "string") {
        const projects = await storage.getProjectsByClientId(parseInt(clientId));
        return res.json(projects);
      }
      
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/projects/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/projects", isAuthenticated, async (req, res, next) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });
  
  app.patch("/api/projects/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, projectData);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });
  
  // Inspection routes
  app.get("/api/inspections", isAuthenticated, async (req, res, next) => {
    try {
      const { userId, clientId, projectId, status } = req.query;
      
      if (userId && typeof userId === "string") {
        const inspections = await storage.getInspectionsByUserId(parseInt(userId));
        return res.json(inspections);
      }
      
      if (clientId && typeof clientId === "string") {
        const inspections = await storage.getInspectionsByClientId(parseInt(clientId));
        return res.json(inspections);
      }
      
      if (projectId && typeof projectId === "string") {
        const inspections = await storage.getInspectionsByProjectId(parseInt(projectId));
        return res.json(inspections);
      }
      
      if (status && typeof status === "string") {
        const inspections = await storage.getInspectionsByStatus(status);
        return res.json(inspections);
      }
      
      const inspections = await storage.getInspections();
      res.json(inspections);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/inspections/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const inspection = await storage.getInspection(id);
      
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      res.json(inspection);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/inspections", isAuthenticated, async (req, res, next) => {
    try {
      const inspectionData = insertInspectionSchema.parse(req.body);
      const inspection = await storage.createInspection(inspectionData);
      res.status(201).json(inspection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });
  
  app.patch("/api/inspections/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const inspectionData = insertInspectionSchema.partial().parse(req.body);
      const inspection = await storage.updateInspection(id, inspectionData);
      
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      res.json(inspection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });
  
  // Evidence routes
  app.get("/api/evidences", isAuthenticated, async (req, res, next) => {
    try {
      const { inspectionId } = req.query;
      
      if (inspectionId && typeof inspectionId === "string") {
        const evidences = await storage.getEvidencesByInspectionId(parseInt(inspectionId));
        return res.json(evidences);
      }
      
      res.status(400).json({ message: "inspectionId query parameter is required" });
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/evidences/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const evidence = await storage.getEvidence(id);
      
      if (!evidence) {
        return res.status(404).json({ message: "Evidence not found" });
      }
      
      res.json(evidence);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/evidences", isAuthenticated, async (req, res, next) => {
    try {
      const evidenceData = insertEvidenceSchema.parse(req.body);
      const evidence = await storage.createEvidence(evidenceData);
      res.status(201).json(evidence);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });
  
  app.patch("/api/evidences/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const evidenceData = insertEvidenceSchema.partial().parse(req.body);
      const evidence = await storage.updateEvidence(id, evidenceData);
      
      if (!evidence) {
        return res.status(404).json({ message: "Evidence not found" });
      }
      
      res.json(evidence);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });
  
  app.delete("/api/evidences/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvidence(id);
      
      if (!success) {
        return res.status(404).json({ message: "Evidence not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Relatório routes
  app.get("/api/inspections/:id/report", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const inspection = await storage.getInspection(id);
      
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      // Verificar se a inspeção tem os campos necessários
      if (!inspection.clientId || !inspection.projectId) {
        return res.status(400).json({ 
          message: "Dados de inspeção incompletos. Faltam clientId e/ou projectId.",
          inspection: inspection 
        });
      }
      
      // Carregar dados relacionados para o relatório
      const client = await storage.getClient(inspection.clientId);
      const project = await storage.getProject(inspection.projectId);
      const evidences = await storage.getEvidencesByInspectionId(id);
      
      // Buscar informações do técnico
      const technician = await storage.getUser(inspection.userId);
      
      // Estruturar o relatório com dados mais completos
      const report = {
        // Informações da inspeção
        id: inspection.id,
        protocolNumber: inspection.protocolNumber,
        status: inspection.status,
        scheduledDate: inspection.scheduledDate,
        startTime: inspection.startTime,
        endTime: inspection.endTime,
        createdAt: inspection.createdAt,
        updatedAt: inspection.updatedAt,
        
        // Informações do cliente
        client: {
          id: client?.id,
          name: client?.name,
          contactName: client?.contactName,
          contactPhone: client?.contactPhone,
          email: client?.email,
          document: client?.document,
          type: client?.type
        },
        
        // Informações do projeto/local
        project: {
          id: project?.id,
          name: project?.name,
          address: project?.address,
          number: project?.number,
          complement: project?.complement,
          neighborhood: project?.neighborhood,
          city: project?.city,
          state: project?.state,
          zipCode: project?.zipCode,
          latitude: project?.latitude,
          longitude: project?.longitude
        },
        
        // Informações do telhado/produto
        product: {
          roofModel: inspection.roofModel,
          quantity: inspection.quantity,
          area: inspection.area,
          installationDate: inspection.installationDate,
          warranty: inspection.warranty
        },
        
        // Informações do técnico
        technician: {
          id: technician?.id,
          name: technician?.name,
          email: technician?.email
        },
        
        // Conclusão e recomendação
        conclusion: inspection.conclusion,
        recommendation: inspection.recommendation,
        
        // Evidências
        evidences: evidences.map(evidence => ({
          id: evidence.id,
          fileUrl: evidence.fileUrl,
          type: evidence.type,
          category: evidence.category,
          notes: evidence.notes,
          createdAt: evidence.createdAt
        }))
      };
      
      res.json(report);
    } catch (error) {
      console.error("Error generating report:", error);
      next(error);
    }
  });
  
  // Rota para gerar o documento de relatório
  app.post("/api/inspections/:id/generate-report", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const inspection = await storage.getInspection(id);
      
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      // Verificar se a inspeção está concluída
      if (inspection.status !== 'completed') {
        return res.status(400).json({ message: "Relatório só pode ser gerado para inspeções concluídas" });
      }
      
      // Simular geração do documento de relatório
      const reportData = {
        id: `REP-${Date.now()}`,
        inspectionId: inspection.id,
        generatedAt: new Date().toISOString(),
        downloadUrl: `/api/reports/${inspection.id}/download`,
        status: 'generated'
      };
      
      res.json(reportData);
    } catch (error) {
      next(error);
    }
  });
  
  // Rota para download do relatório em PDF
  app.get("/api/reports/:id/download", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const inspection = await storage.getInspection(id);
      
      if (!inspection) {
        return res.status(404).json({ message: "Inspeção não encontrada" });
      }
      
      // Verificar se a inspeção tem os dados necessários
      if (!inspection.clientId || !inspection.projectId) {
        return res.status(400).json({ 
          message: "Dados de inspeção incompletos para geração de PDF" 
        });
      }
      
      // Verificar se a inspeção está concluída
      if (inspection.status !== 'completed') {
        return res.status(400).json({ 
          message: "Relatório em PDF só pode ser gerado para inspeções concluídas" 
        });
      }
      
      // Simular a geração de um arquivo PDF
      const client = await storage.getClient(inspection.clientId);
      
      // Criar resposta simulando um arquivo PDF
      const reportContent = Buffer.from(`
      ======================================
      RELATÓRIO DE VISTORIA TÉCNICA BRASILIT
      ======================================
      
      Protocolo: ${inspection.protocolNumber}
      Data: ${inspection.scheduledDate ? new Date(inspection.scheduledDate).toLocaleDateString('pt-BR') : 'Não agendada'}
      
      INFORMAÇÕES DO CLIENTE
      ---------------------
      Nome: ${client?.name || '-'}
      Contato: ${client?.contactName || '-'}
      Telefone: ${client?.contactPhone || '-'}
      
      DETALHES DA INSPEÇÃO
      -------------------
      Produto: ${inspection.roofModel || '-'}
      Quantidade: ${inspection.quantity || '-'} unidades
      Área: ${inspection.area || '-'} m²
      Data de instalação: ${inspection.installationDate ? new Date(inspection.installationDate).toLocaleDateString('pt-BR') : '-'}
      
      CONCLUSÃO
      ---------
      ${inspection.conclusion || 'Sem conclusão registrada'}
      
      RECOMENDAÇÕES
      -------------
      ${inspection.recommendation || 'Sem recomendações registradas'}
      
      Assinatura: ______________________
      
      Documento gerado em ${new Date().toLocaleString('pt-BR')}
      Para validar este documento, acesse www.brasilit.com.br/validar e informe o código ${inspection.protocolNumber}
      `);
      
      // Configurar headers para download do arquivo
      res.setHeader('Content-Disposition', `attachment; filename="relatorio-${inspection.protocolNumber}.pdf"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', reportContent.length);
      
      // Enviar o conteúdo
      res.end(reportContent);
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      next(error);
    }
  });
  
  // Rota para diagnosticar problemas
  app.get("/api/dev/diagnostics", isAuthenticated, async (req, res, next) => {
    try {
      const diagnostics = {
        clients: await storage.getClients(),
        projects: await storage.getProjects(),
        inspections: await storage.getInspections(),
      };
      
      res.json(diagnostics);
    } catch (error) {
      console.error("Erro ao realizar diagnóstico:", error);
      next(error);
    }
  });
  
  // Rota para garantir relacionamentos diretos (recriação de dados)
  app.post("/api/dev/reset-data", isAuthenticated, async (req, res, next) => {
    try {
      // Reiniciar o armazenamento de dados
      const resetResult = await storage.resetData();
      
      res.json({ 
        message: "Dados redefinidos com sucesso", 
        resetResult 
      });
    } catch (error) {
      console.error("Erro ao redefinir dados:", error);
      next(error);
    }
  });
  
  // Rota para corrigir inspeções (apenas para desenvolvimento)
  app.post("/api/dev/fix-inspections", isAuthenticated, async (req, res, next) => {
    try {
      const client1Id = 1; // Condomínio Solar das Flores
      const client2Id = 2; // Residencial Vila Nova
      const client3Id = 3; // Escola Municipal Monteiro Lobato
      
      const project1Id = 1; // Condomínio Solar das Flores
      const project2Id = 2; // Residencial Vila Nova
      const project3Id = 3; // Escola Municipal Monteiro Lobato
      
      // Mapear IDs de inspeções para clientes e projetos
      const idMap = {
        1: { clientId: client1Id, projectId: project1Id }, // VT-2023-0782
        2: { clientId: client2Id, projectId: project2Id }, // VT-2023-0781
        3: { clientId: client3Id, projectId: project3Id }, // VT-2023-0780
        4: { clientId: client1Id, projectId: project1Id }, // VT-2023-0783
        5: { clientId: client2Id, projectId: project2Id }, // VT-2023-0784
        6: { clientId: client3Id, projectId: project3Id }  // VT-2023-0785
      };
      
      const fixedInspections = [];
      
      // Verificar quais inspeções existem primeiro
      const inspections = await storage.getInspections();
      console.log(`Encontradas ${inspections.length} inspeções no sistema`);
      
      for (const inspection of inspections) {
        console.log(`Inspeção ${inspection.id}: clientId=${inspection.clientId}, projectId=${inspection.projectId}`);
      }
      
      // Atualizar cada inspeção manualmente com força bruta
      for (const [inspectionId, data] of Object.entries(idMap)) {
        try {
          const id = parseInt(inspectionId);
          console.log(`Tentando atualizar inspeção ${id} com clientId=${data.clientId}, projectId=${data.projectId}`);
          
          const inspection = await storage.getInspection(id);
          
          if (inspection) {
            console.log(`Inspeção ${id} encontrada. Status atual: clientId=${inspection.clientId}, projectId=${inspection.projectId}`);
            
            const updatedInspection = await storage.updateInspection(id, {
              clientId: data.clientId,
              projectId: data.projectId
            });
            
            if (updatedInspection) {
              console.log(`Inspeção ${id} atualizada com sucesso: clientId=${updatedInspection.clientId}, projectId=${updatedInspection.projectId}`);
              fixedInspections.push(updatedInspection);
            } else {
              console.error(`Falha ao atualizar inspeção ${id}: objeto de retorno é nulo`);
            }
          } else {
            console.error(`Inspeção ${id} não encontrada`);
          }
        } catch (error) {
          console.error(`Erro ao atualizar inspeção ${inspectionId}:`, error);
        }
      }
      
      res.json({ 
        message: "Inspeções atualizadas com sucesso", 
        fixedCount: fixedInspections.length,
        fixedInspections 
      });
    } catch (error) {
      console.error("Erro ao corrigir inspeções:", error);
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
