import { db } from "@db";
import { 
  clients, 
  projects, 
  tasks, 
  payments,
  Client,
  Project,
  Task,
  Payment
} from "@shared/schema";
import { eq, and, desc, sql, inArray, gte, lt, isNull, isNotNull } from "drizzle-orm";

export const storage = {
  // Client operations
  getClients: async (): Promise<Client[]> => {
    return db.query.clients.findMany({
      orderBy: [desc(clients.createdAt)]
    });
  },
  
  getClientById: async (id: number): Promise<Client | undefined> => {
    return db.query.clients.findFirst({
      where: eq(clients.id, id)
    });
  },
  
  createClient: async (data: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> => {
    const [client] = await db.insert(clients)
      .values({ ...data, updatedAt: new Date() })
      .returning();
    return client;
  },
  
  updateClient: async (id: number, data: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>): Promise<Client | undefined> => {
    const [client] = await db.update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return client;
  },
  
  deleteClient: async (id: number): Promise<boolean> => {
    // Need to check for related projects first to avoid foreign key constraint errors
    const clientProjects = await db.query.projects.findMany({
      where: eq(projects.clientId, id)
    });
    
    if (clientProjects.length > 0) {
      throw new Error("Cannot delete client with associated projects");
    }
    
    const deleted = await db.delete(clients)
      .where(eq(clients.id, id))
      .returning();
    
    return deleted.length > 0;
  },
  
  // Project operations
  getProjects: async (filter?: { status?: string, clientId?: number }): Promise<Project[]> => {
    let query = db.query.projects;
    
    const conditions: any[] = [];
    
    if (filter?.status && filter.status !== 'all') {
      conditions.push(eq(projects.status, filter.status as any));
    }
    
    if (filter?.clientId) {
      conditions.push(eq(projects.clientId, filter.clientId));
    }
    
    if (conditions.length === 0) {
      return query.findMany({
        orderBy: [desc(projects.createdAt)],
        with: {
          client: true
        }
      });
    } else {
      return query.findMany({
        where: and(...conditions),
        orderBy: [desc(projects.createdAt)],
        with: {
          client: true
        }
      });
    }
  },
  
  getProjectById: async (id: number): Promise<Project | undefined> => {
    return db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        client: true
      }
    });
  },
  
  getProjectsWithDeadlineSoon: async (days: number): Promise<Project[]> => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    
    return db.query.projects.findMany({
      where: and(
        gte(projects.deadline as any, today),
        lt(projects.deadline as any, futureDate),
        eq(projects.status, 'in_progress')
      ),
      with: {
        client: true
      }
    });
  },
  
  createProject: async (data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> => {
    const [project] = await db.insert(projects)
      .values({ ...data, updatedAt: new Date() })
      .returning();
    return project;
  },
  
  updateProject: async (id: number, data: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>): Promise<Project | undefined> => {
    const [project] = await db.update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  },
  
  deleteProject: async (id: number): Promise<boolean> => {
    // First check for related tasks and payments
    const projectTasks = await db.query.tasks.findMany({
      where: eq(tasks.projectId, id)
    });
    
    const projectPayments = await db.query.payments.findMany({
      where: eq(payments.projectId, id)
    });
    
    if (projectTasks.length > 0 || projectPayments.length > 0) {
      throw new Error("Cannot delete project with associated tasks or payments");
    }
    
    const deleted = await db.delete(projects)
      .where(eq(projects.id, id))
      .returning();
    
    return deleted.length > 0;
  },
  
  // Task operations
  getTasks: async (filter?: { completed?: boolean, priority?: string, projectId?: number, dueToday?: boolean }): Promise<Task[]> => {
    let query = db.query.tasks;
    
    const conditions: any[] = [];
    
    if (filter?.completed !== undefined) {
      conditions.push(eq(tasks.isCompleted, filter.completed));
    }
    
    if (filter?.priority && filter.priority !== 'all') {
      conditions.push(eq(tasks.priority, filter.priority as any));
    }
    
    if (filter?.projectId) {
      conditions.push(eq(tasks.projectId, filter.projectId));
    }
    
    if (filter?.dueToday) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      conditions.push(and(
        gte(tasks.deadline as any, today),
        lt(tasks.deadline as any, tomorrow)
      ));
    }
    
    if (conditions.length === 0) {
      return query.findMany({
        orderBy: [desc(tasks.createdAt)],
        with: {
          project: {
            with: {
              client: true
            }
          }
        }
      });
    } else {
      return query.findMany({
        where: and(...conditions),
        orderBy: [desc(tasks.createdAt)],
        with: {
          project: {
            with: {
              client: true
            }
          }
        }
      });
    }
  },
  
  getTaskById: async (id: number): Promise<Task | undefined> => {
    return db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        project: {
          with: {
            client: true
          }
        }
      }
    });
  },
  
  createTask: async (data: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> => {
    const [task] = await db.insert(tasks)
      .values({ ...data, updatedAt: new Date() })
      .returning();
    return task;
  },
  
  updateTask: async (id: number, data: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Promise<Task | undefined> => {
    // If marking as completed, set the completedAt timestamp
    const updates: any = { ...data, updatedAt: new Date() };
    
    if (data.isCompleted === true) {
      updates.completedAt = new Date();
    } else if (data.isCompleted === false) {
      updates.completedAt = null;
    }
    
    const [task] = await db.update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  },
  
  deleteTask: async (id: number): Promise<boolean> => {
    const deleted = await db.delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    
    return deleted.length > 0;
  },
  
  // Payment operations
  getPayments: async (filter?: { status?: string, projectId?: number }): Promise<Payment[]> => {
    let query = db.query.payments;
    
    const conditions: any[] = [];
    
    if (filter?.status && filter.status !== 'all') {
      conditions.push(eq(payments.status, filter.status as any));
    }
    
    if (filter?.projectId) {
      conditions.push(eq(payments.projectId, filter.projectId));
    }
    
    if (conditions.length === 0) {
      return query.findMany({
        orderBy: [desc(payments.createdAt)],
        with: {
          project: {
            with: {
              client: true
            }
          }
        }
      });
    } else {
      return query.findMany({
        where: and(...conditions),
        orderBy: [desc(payments.createdAt)],
        with: {
          project: {
            with: {
              client: true
            }
          }
        }
      });
    }
  },
  
  getPaymentById: async (id: number): Promise<Payment | undefined> => {
    return db.query.payments.findFirst({
      where: eq(payments.id, id),
      with: {
        project: {
          with: {
            client: true
          }
        }
      }
    });
  },
  
  getPaymentsDueSoon: async (days: number): Promise<Payment[]> => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    
    return db.query.payments.findMany({
      where: and(
        gte(payments.dueDate as any, today),
        lt(payments.dueDate as any, futureDate),
        eq(payments.status, 'pending')
      ),
      with: {
        project: {
          with: {
            client: true
          }
        }
      }
    });
  },
  
  createPayment: async (data: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> => {
    const [payment] = await db.insert(payments)
      .values({ ...data, updatedAt: new Date() })
      .returning();
    return payment;
  },
  
  updatePayment: async (id: number, data: Partial<Omit<Payment, "id" | "createdAt" | "updatedAt">>): Promise<Payment | undefined> => {
    // If marking as received, set the receivedAt timestamp
    const updates: any = { ...data, updatedAt: new Date() };
    
    if (data.status === 'received') {
      updates.receivedAt = new Date();
    } else if (data.status === 'pending') {
      updates.receivedAt = null;
    }
    
    const [payment] = await db.update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  },
  
  deletePayment: async (id: number): Promise<boolean> => {
    const deleted = await db.delete(payments)
      .where(eq(payments.id, id))
      .returning();
    
    return deleted.length > 0;
  },
  
  // Dashboard stats
  getDashboardStats: async () => {
    // Active projects
    const activeProjects = await db.query.projects.findMany({
      where: eq(projects.status, 'in_progress')
    });
    
    // Today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTasks = await db.query.tasks.findMany({
      where: and(
        gte(tasks.deadline as any, today),
        lt(tasks.deadline as any, tomorrow)
      )
    });
    
    const completedTodayTasks = await db.query.tasks.findMany({
      where: and(
        gte(tasks.deadline as any, today),
        lt(tasks.deadline as any, tomorrow),
        eq(tasks.isCompleted, true)
      )
    });
    
    // Projects due soon (next 7 days)
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    const projectsDueSoon = await db.query.projects.findMany({
      where: and(
        gte(projects.deadline as any, today),
        lt(projects.deadline as any, sevenDaysLater),
        eq(projects.status, 'in_progress')
      )
    });
    
    // Urgent projects (high priority tasks with close deadlines)
    const urgentProjects = await db.query.tasks.findMany({
      where: and(
        eq(tasks.priority, 'high'),
        gte(tasks.deadline as any, today),
        lt(tasks.deadline as any, sevenDaysLater),
        eq(tasks.isCompleted, false)
      )
    });
    
    // Pending payments
    const pendingPayments = await db.query.payments.findMany({
      where: eq(payments.status, 'pending')
    });
    
    // Sum of pending payments
    const pendingPaymentsSum = pendingPayments.reduce((sum, payment) => {
      return sum + (parseFloat(payment.amount.toString()) || 0);
    }, 0);
    
    // Payments due soon (next 30 days)
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    
    const paymentsDueSoon = await db.query.payments.findMany({
      where: and(
        gte(payments.dueDate as any, today),
        lt(payments.dueDate as any, thirtyDaysLater),
        eq(payments.status, 'pending')
      )
    });
    
    const paymentsDueSoonSum = paymentsDueSoon.reduce((sum, payment) => {
      return sum + (parseFloat(payment.amount.toString()) || 0);
    }, 0);
    
    // Invoices to be sent (projects without payments)
    const projectIds = await db.query.projects.findMany({
      columns: {
        id: true
      }
    }).then(projects => projects.map(p => p.id));
    
    const projectsWithPayments = await db.query.payments.findMany({
      columns: {
        projectId: true
      }
    }).then(payments => [...new Set(payments.map(p => p.projectId))]);
    
    const projectsWithoutPayments = projectIds.filter(id => !projectsWithPayments.includes(id));
    
    return {
      activeProjectsCount: activeProjects.length,
      tasksToday: todayTasks.length,
      completedTasksToday: completedTodayTasks.length,
      projectsDueSoonCount: projectsDueSoon.length,
      urgentProjectsCount: urgentProjects.length,
      pendingPaymentsSum,
      paymentsDueSoonSum,
      invoicesToSendCount: projectsWithoutPayments.length
    };
  }
};
