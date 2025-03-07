import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("technician"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "person" or "company"
  document: text("document"), // CPF or CNPJ
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Project schema (empreendimentos)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  number: text("number"),
  complement: text("complement"),
  neighborhood: text("neighborhood"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Inspection schema (vistorias)
export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  protocolNumber: text("protocol_number").notNull().unique(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id").notNull(),
  projectId: integer("project_id").notNull(),
  status: text("status").notNull().default("draft"), // draft, in_progress, completed, reviewed
  scheduledDate: timestamp("scheduled_date"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  roofModel: text("roof_model"),
  quantity: integer("quantity"),
  area: integer("area"),
  installationDate: timestamp("installation_date"),
  warranty: text("warranty"),
  invoice: text("invoice"),
  technicalAnalysis: jsonb("technical_analysis"),
  conclusion: text("conclusion"),
  recommendation: text("recommendation"),
  signature: text("signature"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Evidence schema (photos, documents, etc.)
export const evidences = pgTable("evidences", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").notNull(),
  type: text("type").notNull(), // photo, document, etc.
  category: text("category"), // category of non-conformity
  fileUrl: text("file_url").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEvidenceSchema = createInsertSchema(evidences).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;

export type Evidence = typeof evidences.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;

// Validation schemas (extended from insert schemas)
export const loginSchema = z.object({
  username: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
