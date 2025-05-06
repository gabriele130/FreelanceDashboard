import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User,
  Bell,
  Moon,
  Languages,
  Shield,
  ArchiveRestore,
  Database,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("it");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profilo aggiornato",
      description: "Le informazioni del profilo sono state aggiornate con successo.",
    });
  };
  
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Password aggiornata",
      description: "La password è stata aggiornata con successo.",
    });
  };
  
  const handleSaveSettings = () => {
    toast({
      title: "Impostazioni salvate",
      description: "Le tue preferenze sono state salvate con successo.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
          <TabsTrigger value="appearance">Aspetto</TabsTrigger>
          <TabsTrigger value="advanced">Avanzate</TabsTrigger>
        </TabsList>
        
        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Personali</CardTitle>
              <CardDescription>
                Aggiorna le tue informazioni personali e di contatto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" placeholder="Il tuo nome" defaultValue="Marco Rossi" />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="La tua email" defaultValue="marco.rossi@example.com" />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input id="phone" placeholder="Il tuo numero di telefono" defaultValue="+39 123 456 7890" />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="role">Professione</Label>
                  <Input id="role" placeholder="La tua professione" defaultValue="Web Developer" />
                </div>
                
                <Button type="submit" className="mt-2">Salva Modifiche</Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cambia Password</CardTitle>
              <CardDescription>
                Aggiorna la tua password per mantenere sicuro il tuo account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="current-password">Password Attuale</Label>
                  <Input id="current-password" type="password" placeholder="••••••••" />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="new-password">Nuova Password</Label>
                  <Input id="new-password" type="password" placeholder="••••••••" />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="confirm-password">Conferma Password</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" />
                </div>
                
                <Button type="submit" className="mt-2">Aggiorna Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifiche</CardTitle>
              <CardDescription>
                Configura come e quando ricevere notifiche.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifiche Email</Label>
                  <p className="text-sm text-gray-500">Ricevi aggiornamenti via email</p>
                </div>
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Promemoria Task</Label>
                  <p className="text-sm text-gray-500">Ricevi notifiche per i task in scadenza</p>
                </div>
                <Switch 
                  checked={taskReminders} 
                  onCheckedChange={setTaskReminders} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Avvisi Pagamenti</Label>
                  <p className="text-sm text-gray-500">Ricevi notifiche per i pagamenti in scadenza</p>
                </div>
                <Switch 
                  checked={paymentAlerts} 
                  onCheckedChange={setPaymentAlerts} 
                />
              </div>
              
              <Button onClick={handleSaveSettings} className="mt-4">Salva Preferenze</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aspetto</CardTitle>
              <CardDescription>
                Personalizza l'aspetto dell'applicazione.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Tema Scuro</Label>
                  <p className="text-sm text-gray-500">Attiva la modalità scura</p>
                </div>
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={setIsDarkMode} 
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="language" className="text-base">Lingua</Label>
                <p className="text-sm text-gray-500 mb-2">Seleziona la lingua dell'interfaccia</p>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="it">Italiano</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              
              <Button onClick={handleSaveSettings} className="mt-4">Salva Preferenze</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Avanzate</CardTitle>
              <CardDescription>
                Configura le impostazioni avanzate dell'applicazione.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">ArchiveRestore Automatico</Label>
                  <p className="text-sm text-gray-500">Esegui backup automatici dei dati</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-base">Esporta Dati</Label>
                <p className="text-sm text-gray-500 mb-2">Esporta tutti i tuoi dati in formato CSV</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">Esporta Clienti</Button>
                  <Button variant="outline">Esporta Progetti</Button>
                  <Button variant="outline">Esporta Task</Button>
                  <Button variant="outline">Esporta Pagamenti</Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-base text-destructive">Zona Pericolosa</Label>
                <p className="text-sm text-gray-500 mb-2">Azioni irreversibili sul tuo account</p>
                <Button variant="destructive">Elimina Tutti i Dati</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Informazioni sull'App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Versione</span>
            <span className="text-sm">1.0.0</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Ultimo aggiornamento</span>
            <span className="text-sm">21 Marzo 2023</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Licenza</span>
            <span className="text-sm">Professional</span>
          </div>
          
          <Button variant="outline" className="w-full flex items-center mt-2">
            <ExternalLink className="mr-2 h-4 w-4" />
            Verifica aggiornamenti
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
