import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

// Registra o service worker com suporte a atualizações
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Nova versão disponível. Atualizar agora?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("Aplicativo pronto para uso offline");
  },
  immediate: true
});

createRoot(document.getElementById("root")!).render(<App />);