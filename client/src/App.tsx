import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Layouts
import AppLayout from "./components/layouts/AppLayout";
import AuthLayout from "./components/layouts/AuthLayout";

// Pages
import Dashboard from "./pages/dashboard";
import Inspections from "./pages/inspections";
import NewInspection from "./pages/inspection/new";
import InspectionDetails from "./pages/inspection/[id]";
import Calendar from "./pages/calendar";
import Clients from "./pages/clients";
import Projects from "./pages/projects";
import Reports from "./pages/reports";
import Settings from "./pages/settings";
import Profile from "./pages/profile";
import Login from "./pages/login";
import NotFound from "./pages/not-found";

// PWA Components
import OfflineIndicator from "./components/pwa/OfflineIndicator";
import InstallButton from "./components/pwa/InstallButton";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Rotas autenticadas */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inspections" element={<Inspections />} />
            <Route path="inspection/new" element={<NewInspection />} />
            <Route path="inspection/:id" element={<InspectionDetails />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="clients" element={<Clients />} />
            <Route path="projects" element={<Projects />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Rotas de autenticação */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
          
          {/* Rota 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Componentes PWA */}
        <OfflineIndicator />
        
        {/* Botão de instalação do PWA */}
        <div className="fixed top-4 right-4 z-50">
          <InstallButton />
        </div>
      </Router>
    </QueryClientProvider>
  );
}