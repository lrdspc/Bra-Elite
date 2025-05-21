import { createRoot } from "react-dom/client";
import { Workbox } from 'workbox-window';
import App from "./App";
import "./index.css";

// Verifica se o navegador suporta service workers
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    const wb = new Workbox('/service-worker.js');
    
    wb.register()
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration?.scope);
        
        // Verifica se há atualizações disponíveis
        wb.addEventListener('waiting', () => {
          if (confirm('Uma nova versão está disponível! Recarregar para atualizar?')) {
            // Usa o tipo any para evitar problemas de tipagem
            (wb as any).messageSkipWaiting();
          }
        });
        
        // Atualiza o service worker quando a página for recarregada
        window.addEventListener('beforeunload', () => {
          // Usa o tipo any para evitar problemas de tipagem
          (wb as any).messageSkipWaiting();
        });
      })
      .catch(error => {
        console.error('Falha ao registrar Service Worker:', error);
      });
      
    // Armazena o workbox na janela para uso em outros componentes
    (window as any).workbox = wb;
  });
}

createRoot(document.getElementById("root")!).render(<App />);
