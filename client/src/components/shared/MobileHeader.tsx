import React from 'react';
import { Bell } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10 md:hidden">
      <div className="flex items-center justify-between px-4 h-14">
        <button 
          onClick={onMenuClick}
          className="p-1 rounded-full hover:bg-accent"
        >
          <span className="material-icons">menu</span>
        </button>
        
        <div className="flex items-center">
          <svg width="100" height="30" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.6667 0H33.3333C43.2 0 50 6.8 50 16.6667C50 26.5333 43.2 33.3333 33.3333 33.3333H16.6667C6.8 33.3333 0 26.5333 0 16.6667C0 6.8 6.8 0 16.6667 0Z" fill="hsl(var(--primary))"/>
            <path d="M66.6667 0H83.3333C93.2 0 100 6.8 100 16.6667C100 26.5333 93.2 33.3333 83.3333 33.3333H66.6667C56.8 33.3333 50 26.5333 50 16.6667C50 6.8 56.8 0 66.6667 0Z" fill="hsl(var(--primary))"/>
            <text x="12.5" y="20.8333" fontFamily="Arial" fontSize="13.3333" fontWeight="700" fill="white">BRASI</text>
            <text x="62.5" y="20.8333" fontFamily="Arial" fontSize="13.3333" fontWeight="700" fill="white">LIT</text>
          </svg>
        </div>
        
        <button className="p-1 rounded-full hover:bg-accent relative">
          <Bell className="h-5 w-5 text-neutral-dark" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
