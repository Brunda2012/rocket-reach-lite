import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Landing from "./pages/Landing.tsx";
import Index from "./pages/Index.tsx";
import Discover from "./pages/Discover.tsx";
import Insights from "./pages/Insights.tsx";
import CompanyProfile from "./pages/CompanyProfile.tsx";
import OutreachEngine from "./pages/OutreachEngine.tsx";
import EmailPack from "./pages/EmailPack.tsx";
import Settings from "./pages/Settings.tsx";
import Help from "./pages/Help.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/company" element={<CompanyProfile />} />
            <Route path="/outreach" element={<OutreachEngine />} />
            <Route path="/email-pack" element={<EmailPack />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
