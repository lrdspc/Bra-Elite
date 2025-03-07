import React from 'react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Building2, 
  Building, 
  ClipboardList, 
  History, 
  FileText, 
  Settings, 
  HelpCircle,
  LogOut
} from 'lucide-react';

interface DesktopSidebarProps {
  user: {
    name: string;
    role?: string;
  };
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ user }) => {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/' },
    { label: 'Calendário', icon: <CalendarDays size={20} />, href: '/calendar' },
    { label: 'Clientes', icon: <Building2 size={20} />, href: '/clients' },
    { label: 'Empreendimentos', icon: <Building size={20} />, href: '/projects' },
    { label: 'Em andamento', icon: <ClipboardList size={20} />, href: '/inspections?status=in_progress', category: 'Vistorias' },
    { label: 'Histórico', icon: <History size={20} />, href: '/inspections', category: 'Vistorias' },
    { label: 'Relatórios', icon: <FileText size={20} />, href: '/reports', category: 'Vistorias' },
    { label: 'Configurações', icon: <Settings size={20} />, href: '/settings', category: 'Sistema' },
    { label: 'Ajuda', icon: <HelpCircle size={20} />, href: '/help', category: 'Sistema' },
  ];

  const groupedNavItems = navItems.reduce((acc, item) => {
    const category = item.category || 'Principal';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-neutral-light h-screen fixed left-0 top-0">
      <div className="p-4 border-b border-neutral-light flex items-center">
        <svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.3333 0H46.6667C60.48 0 70 9.52 70 23.3333C70 37.1467 60.48 46.6667 46.6667 46.6667H23.3333C9.52 46.6667 0 37.1467 0 23.3333C0 9.52 9.52 0 23.3333 0Z" fill="hsl(var(--primary))"/>
          <path d="M93.3333 0H116.667C130.48 0 140 9.52 140 23.3333C140 37.1467 130.48 46.6667 116.667 46.6667H93.3333C79.52 46.6667 70 37.1467 70 23.3333C70 9.52 79.52 0 93.3333 0Z" fill="hsl(var(--primary))"/>
          <text x="17.5" y="29.1667" fontFamily="Arial" fontSize="18.6667" fontWeight="700" fill="white">BRASI</text>
          <text x="87.5" y="29.1667" fontFamily="Arial" fontSize="18.6667" fontWeight="700" fill="white">LIT</text>
        </svg>
      </div>
      
      <div className="p-2 overflow-y-auto flex-1">
        {Object.entries(groupedNavItems).map(([category, items]) => (
          <div key={category}>
            <div className="px-2 pt-4 pb-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {category}
              </span>
            </div>
            
            {items.map((item) => {
              const isActive = location === item.href || 
                (item.href !== '/' && location.startsWith(item.href));
                
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                >
                  <a 
                    className={cn(
                      "flex items-center px-2 py-2 mb-1 rounded-md", 
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className={isActive ? "font-medium" : ""}>
                      {item.label}
                    </span>
                  </a>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="mt-auto border-t border-neutral-light p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
            <span className="text-lg font-medium">
              {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.role === 'admin' ? 'Administrador' : 'Técnico Vistoriador'}
            </p>
          </div>
          <button 
            onClick={() => logout()}
            className="ml-2 text-muted-foreground hover:text-foreground"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
