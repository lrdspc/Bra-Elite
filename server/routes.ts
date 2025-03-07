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

export async function registerRoutes(app: Express): Promise<Server> {
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
  
  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  // Auth routes
  app.post("/api/auth/login", (req, res, next) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
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
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/session", (req, res) => {
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
    res.status(401).json({ message: "Not authenticated" });
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

  const httpServer = createServer(app);
  return httpServer;
}
