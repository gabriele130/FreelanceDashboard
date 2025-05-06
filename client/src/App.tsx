import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/main-layout";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Projects from "@/pages/projects";
import Tasks from "@/pages/tasks";
import Payments from "@/pages/payments";
import Settings from "@/pages/settings";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/clients" component={Clients} />
        <Route path="/projects" component={Projects} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/payments" component={Payments} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
