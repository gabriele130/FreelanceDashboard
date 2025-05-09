import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  CheckSquare, 
  EuroIcon, 
  Settings, 
  Menu, 
  X 
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  section?: string;
}

const Sidebar = () => {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const navItems: NavItem[] = [
    {
      section: "Dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="text-lg" />
    },
    {
      section: "Gestione",
      label: "Clienti",
      href: "/clients",
      icon: <Users className="text-lg" />
    },
    {
      label: "Progetti",
      href: "/projects",
      icon: <FolderKanban className="text-lg" />
    },
    {
      label: "Task Giornalieri",
      href: "/tasks",
      icon: <CheckSquare className="text-lg" />
    },
    {
      label: "Pagamenti",
      href: "/payments",
      icon: <EuroIcon className="text-lg" />
    },
    {
      section: "Impostazioni",
      label: "Impostazioni",
      href: "/settings",
      icon: <Settings className="text-lg" />
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed md:hidden z-20 top-4 left-4 p-2 rounded-md bg-gray-800 text-white"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar Backdrop */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 bg-sidebar text-sidebar-foreground w-64 min-h-screen shadow-lg transform transition-transform duration-200 ease-in-out z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <span className="text-primary text-2xl">
              <FolderKanban />
            </span>
            <h1 className="font-bold text-xl">FreelancerFlow</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-300 hover:text-white md:hidden"
          >
            <X className="text-xl" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          <div className="space-y-6">
            {navItems.reduce<React.ReactNode[]>((acc, item, index) => {
              if (item.section) {
                acc.push(
                  <div key={`section-${index}`}>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      {item.section}
                    </p>
                    <Link 
                      href={item.href}
                      className={`sidebar-item ${
                        location === item.href
                          ? "sidebar-item-active"
                          : "sidebar-item-inactive"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </div>
                );
              } else {
                acc.push(
                  <Link 
                    key={`item-${index}`} 
                    href={item.href}
                    className={`sidebar-item ${
                      location === item.href
                        ? "sidebar-item-active"
                        : "sidebar-item-inactive"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              }
              return acc;
            }, [])}
          </div>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <span className="font-medium">MR</span>
            </div>
            <div>
              <p className="font-medium text-sm">Marco Rossi</p>
              <p className="text-gray-400 text-xs">Web Developer</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
