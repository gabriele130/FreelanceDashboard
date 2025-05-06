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
import { UserPlus, Search, Edit, Trash, Phone, Mail, Building, FileText } from "lucide-react";
import { ClientForm } from "@/components/client-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Client } from "@shared/schema";

const Clients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | undefined>(undefined);
  const [clientToDelete, setClientToDelete] = useState<Client | undefined>(undefined);
  
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });
  
  const { mutate: deleteClient } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Cliente eliminato",
        description: "Il cliente è stato eliminato con successo.",
      });
      setClientToDelete(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'eliminazione del cliente.",
        variant: "destructive",
      });
    },
  });
  
  const handleEditClient = (client: Client) => {
    setCurrentClient(client);
    setIsFormOpen(true);
  };
  
  const handleAddClient = () => {
    setCurrentClient(undefined);
    setIsFormOpen(true);
  };
  
  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
  };
  
  const confirmDeleteClient = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
    }
  };
  
  const filteredClients = clients.filter((client: Client) => 
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(search.toLowerCase()))
  );
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>Clienti</CardTitle>
          <Button onClick={handleAddClient}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuovo Cliente
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Nome</TableHead>
                    <TableHead className="w-[25%]">Email</TableHead>
                    <TableHead className="w-[20%]">Telefono</TableHead>
                    <TableHead className="w-[15%]">Azienda</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client: Client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{client.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.phone ? (
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4 text-gray-400" />
                              <span>{client.phone}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {client.company ? (
                            <div className="flex items-center">
                              <Building className="mr-2 h-4 w-4 text-gray-400" />
                              <span>{client.company}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClient(client)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClient(client)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        {search ? "Nessun cliente trovato con questi criteri" : "Nessun cliente disponibile"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Client Detail Cards */}
      {!isLoading && filteredClients.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClients.slice(0, 2).map((client: Client) => (
            <Card key={`detail-${client.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{client.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{client.company || "Freelance"}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditClient(client)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteClient(client)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Mail className="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{client.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefono</p>
                    <p>{client.phone || "Non specificato"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FileText className="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Note</p>
                    <p className="whitespace-pre-line">{client.notes || "Nessuna nota disponibile"}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Cliente dal</p>
                  <p>{formatDate(client.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add/Edit Client Form */}
      <ClientForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={currentClient}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il cliente <strong>{clientToDelete?.name}</strong>?
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Clients;
