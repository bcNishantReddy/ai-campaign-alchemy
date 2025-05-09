
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import CampaignDetails from "./pages/CampaignDetails";
import NewCampaign from "./pages/NewCampaign";
import Settings from "./pages/Settings";
import SolutionsPage from "./pages/SolutionsPage";
import SupportPage from "./pages/SupportPage";
import CompanyPage from "./pages/CompanyPage";
import LegalPage from "./pages/LegalPage";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    <Route path="/campaigns/new" element={
      <ProtectedRoute>
        <NewCampaign />
      </ProtectedRoute>
    } />
    <Route path="/campaigns/:id" element={
      <ProtectedRoute>
        <CampaignDetails />
      </ProtectedRoute>
    } />
    <Route path="/settings" element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    } />
    
    {/* Footer page routes */}
    <Route path="/solutions/:solutionType" element={<SolutionsPage />} />
    <Route path="/support/:supportType" element={<SupportPage />} />
    <Route path="/company/:pageType" element={<CompanyPage />} />
    <Route path="/legal/:documentType" element={<LegalPage />} />
    
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
