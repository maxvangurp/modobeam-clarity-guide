import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Draw from "./pages/Draw.tsx";
import Reading from "./pages/Reading.tsx";
import Insight from "./pages/Insight.tsx";
import History from "./pages/History.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Preferences from "./pages/Preferences.tsx";
import Readings from "./pages/Readings.tsx";
import LifeAreas from "./pages/LifeAreas.tsx";
import LifeAreaDetail from "./pages/LifeAreaDetail.tsx";
import WeeklyInsights from "./pages/WeeklyInsights.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/welcome" element={<Onboarding />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/readings" element={<Readings />} />
          <Route path="/draw/:type" element={<Draw />} />
          <Route path="/reading/:id" element={<Reading />} />
          <Route path="/insight/:id" element={<Insight />} />
          <Route path="/history" element={<History />} />
          <Route path="/insights/weekly" element={<WeeklyInsights />} />
          <Route path="/life-areas" element={<LifeAreas />} />
          <Route path="/life-areas/:id" element={<LifeAreaDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
