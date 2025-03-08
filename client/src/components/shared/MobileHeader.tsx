import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, X, ArrowUp } from 'lucide-react';
import { useLocation } from 'wouter';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('Dashboard');
  const [location] = useLocation();
  const [hasNotifications, setHasNotifications] = useState(true);
  
  // Estados para controlar a visibilidade do cabeçalho ao rolar
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  
  // Atualizar o título com base na rota atual
  useEffect(() => {
    const path = location.split('/')[1];
    let newTitle = 'Dashboard';
    
    switch (path) {
      case 'dashboard':
        newTitle = 'Dashboard';
        break;
      case 'inspections':
        newTitle = 'Vistorias';
        break;
      case 'clients':
        newTitle = 'Clientes';
        break;
      case 'projects':
        newTitle = 'Projetos';
        break;
      case 'calendar':
        newTitle = 'Agenda';
        break;
      case 'reports':
        newTitle = 'Relatórios';
        break;
      case 'settings':
        newTitle = 'Configurações';
        break;
      case 'profile':
        newTitle = 'Perfil';
        break;
    }
    
    setTitle(newTitle);
  }, [location]);
  
  // Controlar a visibilidade do cabeçalho ao rolar a página
  useEffect(() => {
    // Registrar a posição anterior para comparar a direção da rolagem
    let lastScrollY = window.scrollY;
    let scrollingDown = false;
    let scrollTimer: number | null = null;
    
    // Função para verificar se deve mostrar o cabeçalho
    function checkHeader() {
      const currentScrollY = window.scrollY;
      
      // Mostrar botão de scroll para o topo quando estiver longe do topo
      setShowScrollTop(currentScrollY > 300);
      
      // Determinar a direção da rolagem
      scrollingDown = currentScrollY > lastScrollY;
      
      // Lógica melhorada:
      // 1. Se estiver no topo da página (até 5px), sempre mostrar o cabeçalho
      // 2. Se estiver rolando para baixo E não estiver no topo, esconder o cabeçalho
      // 3. Se estiver rolando para cima, mostrar o cabeçalho
      
      if (currentScrollY <= 5) {
        setIsHeaderVisible(true);
      } else if (scrollingDown && currentScrollY > 100) {
        // Esconder o cabeçalho apenas quando rolar para baixo significativamente
        setIsHeaderVisible(false);
      } else if (!scrollingDown) {
        // Mostrar o cabeçalho quando rolar para cima
        setIsHeaderVisible(true);
      }
      
      // Atualizar a última posição
      lastScrollY = currentScrollY;
    }
    
    // Verificar a posição inicial
    checkHeader();
    
    // Função com debounce para melhorar a performance
    const handleScroll = () => {
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
      
      scrollTimer = window.setTimeout(() => {
        checkHeader();
        scrollTimer = null;
      }, 10);
    };
    
    // Adicionar event listener com passive: true para melhor performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Função para rolar para o topo da página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchTerm('');
    }
  };
  
  // Calculando a altura para aplicar o espaçamento correto no conteúdo
  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
  }, [isHeaderVisible, title]);
  
  return (
    <>
      <header 
        ref={headerRef}
        className={`bg-white shadow-sm fixed left-0 right-0 z-30 md:hidden transition-transform duration-200 ease-in-out ${
          isHeaderVisible ? 'transform-none' : 'transform -translate-y-full'
        }`}
      >
        {!showSearch ? (
          <div className="flex items-center justify-between px-4 h-14">
            <button 
              onClick={onMenuClick}
              className="p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Menu principal"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>
            
            <div className="flex items-center">
              <svg 
                width="100" 
                height="30" 
                viewBox="0 0 100 30" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="optimize-gpu"
              >
                <path d="M16.6667 0H33.3333C43.2 0 50 6.8 50 16.6667C50 26.5333 43.2 33.3333 33.3333 33.3333H16.6667C6.8 33.3333 0 26.5333 0 16.6667C0 6.8 6.8 0 16.6667 0Z" fill="#EE1B24"/>
                <path d="M66.6667 0H83.3333C93.2 0 100 6.8 100 16.6667C100 26.5333 93.2 33.3333 83.3333 33.3333H66.6667C56.8 33.3333 50 26.5333 50 16.6667C50 6.8 56.8 0 66.6667 0Z" fill="#EE1B24"/>
                <text x="12.5" y="20.8333" fontFamily="Arial" fontSize="13.3333" fontWeight="700" fill="white">BRASI</text>
                <text x="62.5" y="20.8333" fontFamily="Arial" fontSize="13.3333" fontWeight="700" fill="white">LIT</text>
              </svg>
            </div>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={toggleSearch}
                className="p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Pesquisar"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </button>
              
              <button 
                className="p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors relative"
                aria-label="Notificações"
              >
                <Bell className="h-5 w-5 text-gray-700" />
                {hasNotifications && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center px-2 h-14">
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-1.5 mx-1">
              <Search className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar..."
                className="bg-transparent border-none focus:outline-none text-sm flex-1"
                autoFocus
              />
            </div>
            <button 
              onClick={toggleSearch}
              className="p-2 rounded-full hover:bg-gray-100 ml-1"
              aria-label="Fechar pesquisa"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        )}
        
        {/* Subtítulo da página - mostra a página atual */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center">
          <h1 className="text-sm font-medium text-gray-700">{title}</h1>
        </div>
      </header>
      
      {/* Botão para voltar ao topo */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 p-2 bg-primary text-white rounded-full shadow-lg z-40 md:hidden"
          aria-label="Voltar ao topo"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
};

export default MobileHeader;
