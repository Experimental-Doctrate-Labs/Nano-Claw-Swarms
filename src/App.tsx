import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import ConsoleLayout from "./components/ConsoleLayout";
import ConsoleOverview from "./pages/console/Overview";
import Agents from "./pages/console/Agents";
import Workflows from "./pages/console/Workflows";
import Runs from "./pages/console/Runs";
import Logs from "./pages/console/Logs";
import Secrets from "./pages/console/Secrets";
import ConsoleSettings from "./pages/console/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/console" element={<ConsoleLayout />}>
            <Route index element={<ConsoleOverview />} />
            <Route path="agents" element={<Agents />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="runs" element={<Runs />} />
            <Route path="logs" element={<Logs />} />
            <Route path="secrets" element={<Secrets />} />
            <Route path="settings" element={<ConsoleSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
