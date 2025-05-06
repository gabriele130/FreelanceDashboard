import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const projectStatusEnum = pgEnum('project_status', ['in_progress', 'completed', 'on_hold']);
export const taskPriorityEnum = pgEnum('task_priority', ['high', 'medium', 'low']);
export const paymentStatusEnum = pgEnum('payment_status', ['received', 'pending']);

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  status: projectStatusEnum("status").default('in_progress').notNull(),
  deadline: timestamp("deadline"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  priority: taskPriorityEnum("priority").default('medium').notNull(),
  deadline: timestamp("deadline"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"),
  status: paymentStatusEnum("status").default('pending').notNull(),
  dueDate: timestamp("due_date"),
  receivedAt: timestamp("received_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table (already exists)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Define relations
export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects)
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  tasks: many(tasks),
  payments: many(payments)
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] })
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  project: one(projects, { fields: [payments.projectId], references: [projects.id] })
}));

// Zod schemas for validation
export const clientInsertSchema = createInsertSchema(clients, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Must provide a valid email")
});
export type ClientInsert = z.infer<typeof clientInsertSchema>;
export type Client = typeof clients.$inferSelect;

export const projectInsertSchema = createInsertSchema(projects, {
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
  clientId: (schema) => schema.min(1, "Client must be selected")
});
export type ProjectInsert = z.infer<typeof projectInsertSchema>;
export type Project = typeof projects.$inferSelect;

export const taskInsertSchema = createInsertSchema(tasks, {
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
  projectId: (schema) => schema.min(1, "Project must be selected")
});
export type TaskInsert = z.infer<typeof taskInsertSchema>;
export type Task = typeof tasks.$inferSelect;

export const paymentInsertSchema = createInsertSchema(payments, {
  invoiceNumber: (schema) => schema.min(1, "Invoice number is required"),
  projectId: (schema) => schema.min(1, "Project must be selected"),
  amount: (schema) => schema.min(0, "Amount must be at least 0")
});
export type PaymentInsert = z.infer<typeof paymentInsertSchema>;
export type Payment = typeof payments.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
