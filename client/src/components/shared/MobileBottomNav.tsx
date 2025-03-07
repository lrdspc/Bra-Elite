import React from 'react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { LayoutDashboard, CalendarDays, PlusCircle, Building2, User } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const [location] = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/' },
    { label: 'Agenda', icon: <CalendarDays size={20} />, href: '/calendar' },
    { label: 'Vistoria', icon: <PlusCircle size={28} />, href: '/inspection/new', primary: true },
    { label: 'Clientes', icon: <Building2 size={20} />, href: '/clients' },
    { label: 'Perfil', icon: <User size={20} />, href: '/profile' },
  ];

  return (
    <nav className="bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 right-0 md:hidden z-10">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== '/' && location.startsWith(item.href));
            
          if (item.primary) {
            return (
              <Link key={item.href} href={item.href}>
                <a className="flex flex-col items-center py-2 px-4 text-primary">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white -mt-5 shadow-md">
                    {item.icon}
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </a>
              </Link>
            );
          }
            
          return (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex flex-col items-center py-2 px-4",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
