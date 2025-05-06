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
  Plus, 
  Calendar, 
  User, 
  Euro, 
  FileText,
  Clock,
  Eye
} from "lucide-react";
import { PaymentForm } from "@/components/payment-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Payment } from "@shared/schema";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Payments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | undefined>(undefined);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | undefined>(undefined);
  
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["/api/payments"],
  });
  
  const { mutate: deletePayment } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Pagamento eliminato",
        description: "Il pagamento è stato eliminato con successo.",
      });
      setPaymentToDelete(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'eliminazione del pagamento.",
        variant: "destructive",
      });
    },
  });
  
  const handleEditPayment = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsFormOpen(true);
  };
  
  const handleAddPayment = () => {
    setCurrentPayment(undefined);
    setIsFormOpen(true);
  };
  
  const handleViewPayment = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsDetailsOpen(true);
  };
  
  const handleDeletePayment = (payment: Payment) => {
    setPaymentToDelete(payment);
  };
  
  const confirmDeletePayment = () => {
    if (paymentToDelete) {
      deletePayment(paymentToDelete.id);
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received': return 'Ricevuto';
      case 'pending': return 'In Attesa';
      default: return 'Sconosciuto';
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'received': return 'payment-received';
      case 'pending': return 'payment-pending';
      default: return '';
    }
  };
  
  const filteredPayments = payments
    .filter((payment: Payment) => 
      (statusFilter === "all" || payment.status === statusFilter) &&
      (
        payment.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        payment.project?.title.toLowerCase().includes(search.toLowerCase()) ||
        payment.project?.client?.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>Pagamenti</CardTitle>
          <Button onClick={handleAddPayment}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Pagamento
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca pagamento..."
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
                <SelectItem value="pending">In Attesa</SelectItem>
                <SelectItem value="received">Ricevuti</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Button 
              variant={statusFilter === "all" ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Tutti
            </Button>
            <Button 
              variant={statusFilter === "pending" ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("pending")}
              className="border-warning text-amber-600 hover:bg-amber-100"
            >
              In Attesa
            </Button>
            <Button 
              variant={statusFilter === "received" ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("received")}
            >
              Ricevuti
            </Button>
          </div>
          
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
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
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment: Payment) => (
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
                            payment.dueDate ? `Scade: ${formatDate(payment.dueDate)}` : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <span className={getStatusClass(payment.status)}>
                            {getStatusLabel(payment.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewPayment(payment)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditPayment(payment)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(payment)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                        {search || statusFilter !== "all" ? "Nessun pagamento trovato con questi criteri" : "Nessun pagamento disponibile"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Payment Form */}
      <PaymentForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={currentPayment}
      />
      
      {/* Payment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dettagli Pagamento</DialogTitle>
          </DialogHeader>
          
          {currentPayment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">#{currentPayment.invoiceNumber}</h3>
                <span className={getStatusClass(currentPayment.status)}>
                  {getStatusLabel(currentPayment.status)}
                </span>
              </div>
              
              <div className="flex items-center">
                <User className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Cliente</p>
                  <p>{currentPayment.project?.client?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FileText className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Progetto</p>
                  <p>{currentPayment.project?.title}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Euro className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Importo</p>
                  <p className="text-lg font-semibold">€{Number(currentPayment.amount).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {currentPayment.status === 'received' ? 'Data Ricezione' : 'Scadenza'}
                  </p>
                  <p>
                    {currentPayment.status === 'received' 
                      ? formatDate(currentPayment.receivedAt) 
                      : formatDate(currentPayment.dueDate)
                    }
                  </p>
                </div>
              </div>
              
              {currentPayment.paymentMethod && (
                <div className="flex items-start">
                  <Clock className="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Metodo di Pagamento</p>
                    <p>{currentPayment.paymentMethod}</p>
                  </div>
                </div>
              )}
              
              {currentPayment.notes && (
                <div className="flex items-start">
                  <FileText className="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Note</p>
                    <p className="whitespace-pre-line">{currentPayment.notes}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleEditPayment(currentPayment);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifica
                </Button>
                <Button variant="destructive" onClick={() => {
                  setIsDetailsOpen(false);
                  handleDeletePayment(currentPayment);
                }}>
                  <Trash className="mr-2 h-4 w-4" />
                  Elimina
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!paymentToDelete} onOpenChange={(open) => !open && setPaymentToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il pagamento <strong>#{paymentToDelete?.invoiceNumber}</strong>?
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePayment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Payments;
