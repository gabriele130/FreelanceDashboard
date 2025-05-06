import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDate, formatDeadline } from "@/lib/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Edit, 
  Trash, 
  Plus, 
  Clock,
  CheckCheck
} from "lucide-react";
import { TaskForm } from "@/components/task-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Task, Project } from "@shared/schema";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Tasks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [completedFilter, setCompletedFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<Task | undefined>(undefined);
  
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });
  
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });
  
  const { mutate: deleteTask } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task eliminato",
        description: "Il task è stato eliminato con successo.",
      });
      setTaskToDelete(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'eliminazione del task.",
        variant: "destructive",
      });
    },
  });
  
  const { mutate: toggleTaskCompletion } = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      await apiRequest("PUT", `/api/tasks/${id}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento del task.",
        variant: "destructive",
      });
    },
  });
  
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsFormOpen(true);
  };
  
  const handleAddTask = () => {
    setCurrentTask(undefined);
    setIsFormOpen(true);
  };
  
  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
  };
  
  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
    }
  };
  
  const handleToggleCompletion = (task: Task) => {
    toggleTaskCompletion({
      id: task.id,
      isCompleted: !task.isCompleted
    });
  };
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Bassa';
      default: return 'Media';
    }
  };
  
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };
  
  const filteredTasks = tasks
    .filter((task: Task) => 
      (priorityFilter === "all" || task.priority === priorityFilter) &&
      (completedFilter === "all" || 
       (completedFilter === "completed" && task.isCompleted) || 
       (completedFilter === "pending" && !task.isCompleted)) &&
      (
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase())) ||
        (task.project?.title.toLowerCase().includes(search.toLowerCase())) ||
        (task.project?.client?.name.toLowerCase().includes(search.toLowerCase()))
      )
    );
  
  const groupedTasks: { [key: string]: Task[] } = {};
  
  // Group tasks by project
  filteredTasks.forEach((task: Task) => {
    const projectId = task.projectId.toString();
    if (!groupedTasks[projectId]) {
      groupedTasks[projectId] = [];
    }
    groupedTasks[projectId].push(task);
  });
  
  // Get project details
  const getProjectById = (id: number): Project | undefined => {
    return projects.find((p: Project) => p.id === id);
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>Task Giornalieri</CardTitle>
          <Button onClick={handleAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca task..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-4">
              <Select
                value={priorityFilter}
                onValueChange={setPriorityFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtra per priorità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le priorità</SelectItem>
                  <SelectItem value="high">Alta Priorità</SelectItem>
                  <SelectItem value="medium">Media Priorità</SelectItem>
                  <SelectItem value="low">Bassa Priorità</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={completedFilter}
                onValueChange={setCompletedFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtra per stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="pending">Da Completare</SelectItem>
                  <SelectItem value="completed">Completati</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Button 
              variant={completedFilter === "all" && priorityFilter === "all" ? "secondary" : "outline"} 
              size="sm"
              onClick={() => {
                setPriorityFilter("all");
                setCompletedFilter("all");
              }}
            >
              Tutti
            </Button>
            <Button 
              variant={priorityFilter === "high" ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setPriorityFilter("high")}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              Alta Priorità
            </Button>
            <Button 
              variant={completedFilter === "pending" ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setCompletedFilter("pending")}
            >
              Da Completare
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const today = new Date();
                setSearch(`${today.getDate()}/${today.getMonth() + 1}`);
              }}
            >
              Per Oggi
            </Button>
          </div>
          
          {isLoading ? (
            <>
              <Skeleton className="h-24 mb-3" />
              <Skeleton className="h-24 mb-3" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedTasks).length > 0 ? (
                Object.keys(groupedTasks).map((projectId) => {
                  const project = getProjectById(parseInt(projectId));
                  return (
                    <div key={projectId} className="space-y-3">
                      <h3 className="text-md font-semibold flex items-center">
                        <span className="w-3 h-3 rounded-full bg-primary mr-2"></span>
                        {project?.title} - {project?.client?.name}
                      </h3>
                      
                      {groupedTasks[projectId].map((task: Task) => (
                        <div key={task.id} className="bg-white border rounded-lg p-4 shadow-sm">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3">
                              <Checkbox 
                                checked={task.isCompleted}
                                onCheckedChange={() => handleToggleCompletion(task)}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                                    {task.title}
                                  </h5>
                                  <p className={`text-sm text-gray-500 ${task.isCompleted ? 'text-gray-400' : ''}`}>
                                    {task.project?.title} - {task.project?.client?.name}
                                  </p>
                                </div>
                                <span className={getPriorityClass(task.priority)}>
                                  {getPriorityLabel(task.priority)}
                                </span>
                              </div>
                              
                              {task.description && (
                                <p className={`text-sm text-gray-600 mt-2 ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="mt-3 flex items-center justify-between">
                                <span className={`text-sm ${task.isCompleted ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                                  {task.isCompleted ? (
                                    <>
                                      <CheckCheck className="mr-1 h-4 w-4" />
                                      Completato: {formatDate(task.completedAt)}
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="mr-1 h-4 w-4" />
                                      Scadenza: {formatDeadline(task.deadline)}
                                    </>
                                  )}
                                </span>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    onClick={() => handleEditTask(task)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    onClick={() => handleDeleteTask(task)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
                  {search || priorityFilter !== "all" || completedFilter !== "all" ? 
                    "Nessun task trovato con questi criteri" : 
                    "Nessun task disponibile"
                  }
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Task Form */}
      <TaskForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={currentTask}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il task <strong>{taskToDelete?.title}</strong>?
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Tasks;
