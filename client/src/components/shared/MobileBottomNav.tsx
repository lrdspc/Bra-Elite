import React from 'react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CalendarDays, 
  PlusCircle, 
  Building2, 
  User, 
  Clipboard, 
  FileText 
} from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const [location] = useLocation();

  const navItems = [
    { 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={18} strokeWidth={2} />, 
      activeIcon: <LayoutDashboard size={18} strokeWidth={2.5} />,
      href: '/' 
    },
    { 
      label: 'Agenda', 
      icon: <CalendarDays size={18} strokeWidth={2} />, 
      activeIcon: <CalendarDays size={18} strokeWidth={2.5} />,
      href: '/calendar' 
    },
    { 
      label: 'Nova Vistoria', 
      icon: <PlusCircle size={26} strokeWidth={2} />, 
      activeIcon: <PlusCircle size={26} strokeWidth={2.5} />,
      href: '/inspection/new', 
      primary: true 
    },
    { 
      label: 'Vistorias', 
      icon: <Clipboard size={18} strokeWidth={2} />, 
      activeIcon: <Clipboard size={18} strokeWidth={2.5} />,
      href: '/inspections' 
    },
    { 
      label: 'Relatórios', 
      icon: <FileText size={18} strokeWidth={2} />, 
      activeIcon: <FileText size={18} strokeWidth={2.5} />,
      href: '/reports' 
    },
  ];

  return (
    <nav className="bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] fixed bottom-0 left-0 right-0 md:hidden z-10 h-16 optimize-gpu">
      <div className="flex justify-around h-full">
        {navItems.map((item) => {
          const isActive = 
            location === item.href || 
            (item.href !== '/' && location.startsWith(item.href)) ||
            (item.href === '/' && location === '/dashboard');
            
          if (item.primary) {
            return (
              <Link key={item.href} href={item.href}>
                <a className="flex flex-col items-center justify-center py-1 px-2 text-white relative">
                  <div className="w-12 h-12 bg-brasilit-red hover:bg-red-600 active:bg-red-700 rounded-full flex items-center justify-center -mt-5 shadow-lg transition-all duration-200 optimized-animation transform hover:scale-105 active:scale-95">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 mt-1">{item.label}</span>
                </a>
              </Link>
            );
          }
            
          return (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex flex-col items-center justify-center py-1 px-1 relative",
                "transition-colors duration-200 tap-highlight-transparent",
                isActive 
                  ? "text-brasilit-red" 
                  : "text-gray-500 hover:text-gray-700 active:text-gray-900"
              )}>
                <div className={cn(
                  "p-1.5 rounded-full transition-all duration-200",
                  isActive && "bg-red-50"
                )}>
                  {isActive ? item.activeIcon : item.icon}
                </div>
                <span className={cn(
                  "text-[10px] mt-0.5",
                  isActive ? "font-medium" : "font-normal"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-brasilit-red rounded-t-full" />
                )}
              </a>
            </Link>
          );
        })}
      </div>
      
      {/* Linha segura para garantir que o conteúdo não fique atrás do nav em dispositivos com "notch" */}
      <div className="h-safe-bottom bg-white"></div>
    </nav>
  );
};

export default MobileBottomNav;
