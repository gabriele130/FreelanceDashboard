import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  FolderPlus, 
  Calendar, 
  User, 
  Euro, 
  FileText,
  Clock
} from "lucide-react";
import { ProjectForm } from "@/components/project-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Project } from "@shared/schema";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Projects = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | undefined>(undefined);
  const [projectToDelete, setProjectToDelete] = useState<Project | undefined>(undefined);
  
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });
  
  const { mutate: deleteProject } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Progetto eliminato",
        description: "Il progetto è stato eliminato con successo.",
      });
      setProjectToDelete(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'eliminazione del progetto.",
        variant: "destructive",
      });
    },
  });
  
  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setIsFormOpen(true);
  };
  
  const handleAddProject = () => {
    setCurrentProject(undefined);
    setIsFormOpen(true);
  };
  
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
  };
  
  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'In Corso';
      case 'completed': return 'Completato';
      case 'on_hold': return 'In Attesa';
      default: return 'Sconosciuto';
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'on_hold': return 'status-on-hold';
      default: return '';
    }
  };
  
  const filteredProjects = projects
    .filter((project: Project) => 
      (statusFilter === "all" || project.status === statusFilter) &&
      (
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        (project.client?.name.toLowerCase().includes(search.toLowerCase()))
      )
    );
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>Progetti</CardTitle>
          <Button onClick={handleAddProject}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Nuovo Progetto
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca progetto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtra per stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="in_progress">In Corso</SelectItem>
                <SelectItem value="completed">Completati</SelectItem>
                <SelectItem value="on_hold">In Attesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Titolo</TableHead>
                    <TableHead className="w-[20%]">Cliente</TableHead>
                    <TableHead className="w-[15%]">Stato</TableHead>
                    <TableHead className="w-[15%]">Scadenza</TableHead>
                    <TableHead className="w-[10%]">Importo</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project: Project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{project.client?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={getStatusClass(project.status)}>
                            {getStatusLabel(project.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {project.deadline ? (
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                              <span>{formatDate(project.deadline)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {project.amount ? (
                            <div className="flex items-center font-medium">
                              <Euro className="mr-1 h-4 w-4 text-gray-400" />
                              <span>{Number(project.amount).toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditProject(project)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                        {search || statusFilter !== "all" ? "Nessun progetto trovato con questi criteri" : "Nessun progetto disponibile"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Project Detail Cards */}
      {!isLoading && filteredProjects.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.slice(0, 3).map((project: Project) => (
            <Card key={`detail-${project.id}`} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{project.client?.name}</p>
                  </div>
                  <span className={getStatusClass(project.status)}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-2 space-y-4">
                <p className="text-sm text-gray-600">{project.description || "Nessuna descrizione disponibile"}</p>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progresso</span>
                    <span className="text-gray-800">
                      {project.status === 'completed' ? '100%' : project.status === 'in_progress' ? '65%' : '25%'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
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
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>
                    {project.deadline ? formatDate(project.deadline) : "Nessuna scadenza"}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Euro className="mr-1 h-4 w-4" />
                  <span>
                    {project.amount ? `€${Number(project.amount).toFixed(2)}` : "Importo non specificato"}
                  </span>
                </div>
                
                {project.notes && (
                  <div className="flex items-start text-sm text-gray-600">
                    <FileText className="mr-1 h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {project.notes}
                    </span>
                  </div>
                )}
              </CardContent>
              <div className="bg-gray-50 px-4 py-3 border-t flex justify-between">
                <Button variant="ghost" className="text-primary text-sm font-medium p-0 h-auto">
                  Visualizza Dettagli
                </Button>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditProject(project)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteProject(project)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add/Edit Project Form */}
      <ProjectForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={currentProject}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il progetto <strong>{projectToDelete?.title}</strong>?
              Questa azione non può essere annullata. I task e i pagamenti associati potrebbero impedire l'eliminazione.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Projects;
