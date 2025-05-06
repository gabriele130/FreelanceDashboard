import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDate, formatDeadline, formatPaymentDate } from "@/lib/date-utils";
import StatsCard from "@/components/stats-card";
import { 
  CheckSquare, 
  FolderKanban, 
  EuroIcon, 
  Clock, 
  Edit, 
  Eye, 
  Trash 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Project, Task, Payment } from "@shared/schema";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });
  
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/projects"],
  });
  
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["/api/tasks"],
  });
  
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["/api/payments"],
  });
  
  const getDueTasks = () => {
    if (!tasks) return [];
    return tasks
      .filter((task: Task) => !task.isCompleted && task.deadline)
      .sort((a: Task, b: Task) => new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime())
      .slice(0, 3);
  };
  
  const getRecentProjects = () => {
    if (!projects) return [];
    return projects
      .sort((a: Project, b: Project) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 2);
  };
  
  const getRecentPayments = () => {
    if (!payments) return [];
    return payments
      .sort((a: Payment, b: Payment) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
  };
  
  const getTaskPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };
  
  const getProjectStatusClass = (status: string) => {
    switch (status) {
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'on_hold': return 'status-on-hold';
      default: return 'status-in-progress';
    }
  };
  
  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case 'received': return 'payment-received';
      case 'pending': return 'payment-pending';
      default: return 'payment-pending';
    }
  };
  
  const getProjectStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'In Corso';
      case 'completed': return 'Completato';
      case 'on_hold': return 'In Attesa';
      default: return 'In Corso';
    }
  };
  
  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'received': return 'Ricevuto';
      case 'pending': return 'In Attesa';
      default: return 'In Attesa';
    }
  };
  
  const getTaskPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Bassa';
      default: return 'Media';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome & Quick Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Benvenuto, Marco!</h3>
              <p className="text-gray-600 mt-1">Ecco una panoramica del tuo lavoro di oggi</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-1 text-sm">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">{formatDate(new Date())}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoadingStats ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : (
              <>
                <StatsCard
                  title="Task di oggi"
                  value={stats?.tasksToday || 0}
                  icon={CheckSquare}
                  color="blue"
                  subtitle="Completati"
                  subtitleValue={`${stats?.completedTasksToday || 0}/${stats?.tasksToday || 0}`}
                  progress={stats?.tasksToday ? (stats.completedTasksToday / stats.tasksToday) * 100 : 0}
                />
                
                <StatsCard
                  title="Progetti attivi"
                  value={stats?.activeProjectsCount || 0}
                  icon={FolderKanban}
                  color="purple"
                  subtitle="In Scadenza (7gg)"
                  subtitleValue={`${stats?.projectsDueSoonCount || 0}`}
                  indicator={{ color: "danger", label: `Urgenti: ${stats?.urgentProjectsCount || 0}` }}
                />
                
                <StatsCard
                  title="Pagamenti in attesa"
                  value={`€${stats?.pendingPaymentsSum?.toFixed(2) || "0.00"}`}
                  icon={EuroIcon}
                  color="green"
                  subtitle="In scadenza (30gg)"
                  subtitleValue={`€${stats?.paymentsDueSoonSum?.toFixed(2) || "0.00"}`}
                  indicator={{ color: "warning", label: `${stats?.invoicesToSendCount || 0} Fatture da inviare` }}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Dashboard Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b border-gray-200">
              <TabsList className="h-auto bg-transparent justify-start w-full rounded-none">
                <TabsTrigger
                  value="overview"
                  className="py-4 px-4 data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 data-[state=inactive]:border-transparent rounded-none"
                >
                  Panoramica
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="py-4 px-4 data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 data-[state=inactive]:border-transparent rounded-none"
                >
                  Task Recenti
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="py-4 px-4 data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 data-[state=inactive]:border-transparent rounded-none"
                >
                  Progetti
                </TabsTrigger>
                <TabsTrigger
                  value="payments"
                  className="py-4 px-4 data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 data-[state=inactive]:border-transparent rounded-none"
                >
                  Pagamenti
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="pt-6 px-6 pb-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <Clock className="mr-2 text-primary h-5 w-5" />
                  Task In Scadenza
                </h4>
                {isLoadingTasks ? (
                  <Skeleton className="h-60" />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Progetto</TableHead>
                          <TableHead>Scadenza</TableHead>
                          <TableHead>Priorità</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getDueTasks().length > 0 ? (
                          getDueTasks().map((task: Task) => (
                            <TableRow key={task.id}>
                              <TableCell className="font-medium">{task.title}</TableCell>
                              <TableCell>{task.project?.client?.name}</TableCell>
                              <TableCell>{task.project?.title}</TableCell>
                              <TableCell className={task.deadline && new Date(task.deadline) <= new Date() ? 'text-danger font-medium' : ''}>
                                {formatDeadline(task.deadline)}
                              </TableCell>
                              <TableCell>
                                <span className={getTaskPriorityClass(task.priority)}>
                                  {getTaskPriorityLabel(task.priority)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                              Nessun task in scadenza
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progetti recenti */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <FolderKanban className="mr-2 text-accent h-5 w-5" />
                    Progetti Recenti
                  </h4>
                  
                  {isLoadingProjects ? (
                    <>
                      <Skeleton className="h-32 mb-3" />
                      <Skeleton className="h-32" />
                    </>
                  ) : (
                    <div className="space-y-3">
                      {getRecentProjects().length > 0 ? (
                        getRecentProjects().map((project: Project) => (
                          <div key={project.id} className="bg-white border rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium">{project.title}</h5>
                                <p className="text-sm text-gray-500">{project.client?.name}</p>
                              </div>
                              <span className={getProjectStatusClass(project.status)}>
                                {getProjectStatusLabel(project.status)}
                              </span>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progresso</span>
                                <span className="text-gray-800">
                                  {project.status === 'completed' ? '100%' : project.status === 'in_progress' ? '65%' : '25%'}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                <div 
                                  className={`h-2 ${
                                    project.status === 'completed' ? 'bg-secondary' : 
                                    project.status === 'in_progress' ? 'bg-primary' : 'bg-gray-400'
                                  } rounded-full`}
                                  style={{ 
                                    width: project.status === 'completed' ? '100%' : 
                                          project.status === 'in_progress' ? '65%' : '25%' 
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Clock className="mr-1 h-4 w-4" />
                                {project.status === 'completed' ? 
                                  `Completato: ${formatDate(project.updatedAt)}` : 
                                  `Scadenza: ${formatDate(project.deadline)}`
                                }
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white border rounded-lg p-4 text-center text-gray-500">
                          Nessun progetto recente
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pagamenti recenti */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <EuroIcon className="mr-2 text-secondary h-5 w-5" />
                    Ultimi Pagamenti
                  </h4>
                  
                  {isLoadingPayments ? (
                    <>
                      <Skeleton className="h-24 mb-3" />
                      <Skeleton className="h-24 mb-3" />
                      <Skeleton className="h-24" />
                    </>
                  ) : (
                    <div className="space-y-3">
                      {getRecentPayments().length > 0 ? (
                        getRecentPayments().map((payment: Payment) => (
                          <div key={payment.id} className="bg-white border rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium">Fattura #{payment.invoiceNumber}</h5>
                                <p className="text-sm text-gray-500">{payment.project?.client?.name}</p>
                              </div>
                              <span className={getPaymentStatusClass(payment.status)}>
                                {getPaymentStatusLabel(payment.status)}
                              </span>
                            </div>
                            <div className="mt-2 flex justify-between">
                              <p className="text-lg font-bold">€{Number(payment.amount).toFixed(2)}</p>
                              <p className="text-sm text-gray-500">
                                {payment.status === 'received' ? 
                                  formatDate(payment.receivedAt) : 
                                  formatPaymentDate(payment.dueDate, 'pending')
                                }
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white border rounded-lg p-4 text-center text-gray-500">
                          Nessun pagamento recente
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Task Tab */}
            <TabsContent value="tasks" className="pt-6 px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Task Giornalieri</h4>
                <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium flex items-center">
                  <span className="mr-1">+</span>
                  Nuovo Task
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <button className="px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-700 font-medium">Tutti</button>
                <button className="px-3 py-1.5 bg-white border border-destructive rounded-lg text-sm text-destructive font-medium">Alta Priorità</button>
                <button className="px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-700 font-medium">Per Oggi</button>
                <button className="px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-700 font-medium">Per Progetto</button>
              </div>
              
              {isLoadingTasks ? (
                <>
                  <Skeleton className="h-40 mb-3" />
                  <Skeleton className="h-40 mb-3" />
                  <Skeleton className="h-40" />
                </>
              ) : (
                <div className="space-y-3">
                  {tasks && tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task: Task) => (
                      <div key={task.id} className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 accent-primary" checked={task.isCompleted} readOnly />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>{task.title}</h5>
                                <p className={`text-sm text-gray-500 ${task.isCompleted ? 'text-gray-400' : ''}`}>
                                  {task.project?.title} - {task.project?.client?.name}
                                </p>
                              </div>
                              <span className={getTaskPriorityClass(task.priority)}>
                                {getTaskPriorityLabel(task.priority)}
                              </span>
                            </div>
                            <p className={`text-sm text-gray-600 mt-2 ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
                              {task.description}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className={`text-sm ${task.isCompleted ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                                <Clock className="mr-1 h-4 w-4" />
                                {task.isCompleted ? 
                                  `Completato: ${formatDate(task.completedAt)}` : 
                                  `Scadenza: ${formatDeadline(task.deadline)}`
                                }
                              </span>
                              <div className="flex space-x-2">
                                <button className="p-1 text-gray-500 hover:text-primary">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="p-1 text-gray-500 hover:text-destructive">
                                  <Trash className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white border rounded-lg p-4 text-center text-gray-500">
                      Nessun task disponibile
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Projects Tab */}
            <TabsContent value="projects" className="pt-6 px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Progetti Attivi</h4>
                <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium flex items-center">
                  <span className="mr-1">+</span>
                  Nuovo Progetto
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <button className="px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-700 font-medium">Tutti</button>
                <button className="px-3 py-1.5 bg-white border border-primary rounded-lg text-sm text-primary font-medium">In Corso</button>
                <button className="px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-700 font-medium">Completati</button>
                <button className="px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-700 font-medium">In Attesa</button>
              </div>
              
              {isLoadingProjects ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects && projects.length > 0 ? (
                    projects.slice(0, 6).map((project: Project) => (
                      <div key={project.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h5 className="font-semibold text-lg">{project.title}</h5>
                            <span className={getProjectStatusClass(project.status)}>
                              {getProjectStatusLabel(project.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{project.client?.name}</p>
                          <p className="text-sm text-gray-600 mt-3">
                            {project.description}
                          </p>
                          
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Progresso</span>
                              <span className="text-gray-800">
                                {project.status === 'completed' ? '100%' : project.status === 'in_progress' ? '65%' : '25%'}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                              <div 
                                className={`h-2 ${
                                  project.status === 'completed' ? 'bg-secondary' : 
                                  project.status === 'in_progress' ? 'bg-primary' : 'bg-gray-400'
                                } rounded-full`}
                                style={{ 
                                  width: project.status === 'completed' ? '100%' : 
                                        project.status === 'in_progress' ? '65%' : '25%' 
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center text-sm text-gray-600">
                            <div className="flex items-center mr-4">
                              <Clock className="mr-1 h-4 w-4" />
                              <span>{formatDate(project.deadline)}</span>
                            </div>
                            <div className="flex items-center">
                              <EuroIcon className="mr-1 h-4 w-4" />
                              <span>€{project.amount ? Number(project.amount).toFixed(2) : "0.00"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-3 border-t flex justify-between">
                          <button className="text-primary text-sm font-medium">
                            Visualizza Dettagli
                          </button>
                          <div className="flex space-x-2">
                            <button className="p-1 text-gray-500 hover:text-primary">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-500 hover:text-destructive">
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 bg-white border rounded-lg p-4 text-center text-gray-500">
                      Nessun progetto disponibile
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Payments Tab */}
            <TabsContent value="payments" className="pt-6 px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Pagamenti</h4>
                <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium flex items-center">
                  <span className="mr-1">+</span>
                  Nuovo Pagamento
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <button className="px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-700 font-medium">Tutti</button>
                <button className="px-3 py-1.5 bg-white border border-warning rounded-lg text-sm text-amber-600 font-medium">In Attesa</button>
                <button className="px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-700 font-medium">Ricevuti</button>
              </div>
              
              {isLoadingPayments ? (
                <Skeleton className="h-64" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fattura</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Progetto</TableHead>
                        <TableHead>Importo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments && payments.length > 0 ? (
                        payments.slice(0, 5).map((payment: Payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">#{payment.invoiceNumber}</TableCell>
                            <TableCell>{payment.project?.client?.name}</TableCell>
                            <TableCell>{payment.project?.title}</TableCell>
                            <TableCell className="font-medium">
                              €{Number(payment.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {payment.status === 'received' ? 
                                formatDate(payment.receivedAt) : 
                                formatPaymentDate(payment.dueDate, 'pending')
                              }
                            </TableCell>
                            <TableCell>
                              <span className={getPaymentStatusClass(payment.status)}>
                                {getPaymentStatusLabel(payment.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <button className="p-1 text-gray-500 hover:text-primary">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="p-1 text-gray-500 hover:text-primary">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="p-1 text-gray-500 hover:text-destructive">
                                  <Trash className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                            Nessun pagamento disponibile
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
