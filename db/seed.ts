import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    // Check if we already have data
    const existingClients = await db.query.clients.findMany({
      limit: 1
    });
    
    if (existingClients.length > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }
    
    console.log("Seeding database...");
    
    // Seed clients
    const clients = [
      {
        name: "Tecnosoft SRL",
        email: "info@tecnosoft.com",
        phone: "+39 123 456 7890",
        company: "Tecnosoft SRL",
        notes: "E-commerce company"
      },
      {
        name: "Digital Marketing Pro",
        email: "contact@digitalmarketingpro.com",
        phone: "+39 234 567 8901",
        company: "Digital Marketing Pro",
        notes: "Digital marketing agency"
      },
      {
        name: "Innovative Solutions",
        email: "hello@innovative-solutions.com",
        phone: "+39 345 678 9012",
        company: "Innovative Solutions",
        notes: "Mobile app development company"
      }
    ];
    
    const insertedClients = await Promise.all(
      clients.map(async (client) => {
        const validatedClient = schema.clientInsertSchema.parse(client);
        const [inserted] = await db.insert(schema.clients).values(validatedClient).returning();
        return inserted;
      })
    );
    
    console.log(`Inserted ${insertedClients.length} clients`);
    
    // Seed projects
    const projects = [
      {
        title: "E-commerce Redesign",
        description: "Redesign completo del sito e-commerce con nuovo layout responsive e miglioramento UX.",
        clientId: insertedClients[0].id,
        status: "in_progress" as const,
        deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        amount: "3500.00",
        notes: "Include redesign di homepage, catalogo, e checkout"
      },
      {
        title: "Blog Aziendale",
        description: "Sviluppo blog WordPress con tema personalizzato e integrazione newsletter.",
        clientId: insertedClients[1].id,
        status: "completed" as const,
        deadline: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        amount: "1800.00",
        notes: "Include 5 articoli iniziali"
      },
      {
        title: "App Mobile",
        description: "Sviluppo app React Native per gestione inventario con sincronizzazione cloud.",
        clientId: insertedClients[2].id,
        status: "on_hold" as const,
        deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000), // 55 days from now
        amount: "5200.00",
        notes: "In attesa di approvazione design"
      }
    ];
    
    const insertedProjects = await Promise.all(
      projects.map(async (project) => {
        const validatedProject = schema.projectInsertSchema.parse(project);
        const [inserted] = await db.insert(schema.projects).values(validatedProject).returning();
        return inserted;
      })
    );
    
    console.log(`Inserted ${insertedProjects.length} projects`);
    
    // Seed tasks
    const tasks = [
      {
        title: "Sviluppo Homepage",
        description: "Completare il layout responsive della homepage e implementare le animazioni richieste.",
        projectId: insertedProjects[0].id,
        priority: "high" as const,
        deadline: new Date(), // Today
        isCompleted: false
      },
      {
        title: "Ottimizzazione SEO",
        description: "Implementare le meta tags e ottimizzare le immagini per migliorare il SEO del blog.",
        projectId: insertedProjects[1].id,
        priority: "medium" as const,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        isCompleted: false
      },
      {
        title: "Riunione Cliente",
        description: "Videochiamata per discutere i requisiti della nuova app mobile.",
        projectId: insertedProjects[2].id,
        priority: "low" as const,
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        isCompleted: true,
        completedAt: new Date()
      },
      {
        title: "Setup Database",
        description: "Configurare il database per il progetto e-commerce",
        projectId: insertedProjects[0].id,
        priority: "low" as const,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        isCompleted: false
      }
    ];
    
    const insertedTasks = await Promise.all(
      tasks.map(async (task) => {
        const validatedTask = schema.taskInsertSchema.parse(task);
        const [inserted] = await db.insert(schema.tasks).values(validatedTask).returning();
        return inserted;
      })
    );
    
    console.log(`Inserted ${insertedTasks.length} tasks`);
    
    // Seed payments
    const payments = [
      {
        invoiceNumber: "INV-001",
        projectId: insertedProjects[0].id,
        amount: "1500.00",
        paymentMethod: "Bank Transfer",
        status: "received" as const,
        receivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        notes: "Down payment"
      },
      {
        invoiceNumber: "INV-002",
        projectId: insertedProjects[1].id,
        amount: "850.00",
        paymentMethod: "PayPal",
        status: "pending" as const,
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        notes: "First installment"
      },
      {
        invoiceNumber: "INV-003",
        projectId: insertedProjects[2].id,
        amount: "1200.00",
        paymentMethod: "Bank Transfer",
        status: "pending" as const,
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        notes: "Down payment"
      }
    ];
    
    const insertedPayments = await Promise.all(
      payments.map(async (payment) => {
        const validatedPayment = schema.paymentInsertSchema.parse(payment);
        const [inserted] = await db.insert(schema.payments).values(validatedPayment).returning();
        return inserted;
      })
    );
    
    console.log(`Inserted ${insertedPayments.length} payments`);
    
    // Add a default user if one doesn't exist
    const existingUsers = await db.query.users.findMany({
      limit: 1
    });
    
    if (existingUsers.length === 0) {
      const user = {
        username: "marco",
        password: "password123"
      };
      
      const [insertedUser] = await db.insert(schema.users).values(user).returning();
      console.log(`Created default user: ${insertedUser.username}`);
    }
    
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
