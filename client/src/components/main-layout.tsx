import { Bell, Search, Menu } from "lucide-react";
import Sidebar from "./sidebar";
import { useState } from "react";
import { useLocation } from "wouter";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get page title based on the current route
  const getPageTitle = () => {
    const path = location;
    
    switch (path) {
      case "/":
      case "/dashboard":
        return "Dashboard";
      case "/clients":
        return "Clienti";
      case "/projects":
        return "Progetti";
      case "/tasks":
        return "Task Giornalieri";
      case "/payments":
        return "Pagamenti";
      case "/settings":
        return "Impostazioni";
      default:
        return "404 - Pagina Non Trovata";
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 text-gray-600 hover:text-gray-800 md:hidden"
              >
                <Menu className="text-xl" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800">
                {getPageTitle()}
              </h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-800 relative">
                <Bell className="text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800">
                <Search className="text-xl" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
