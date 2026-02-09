import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ContentCreator from "./pages/ContentCreator";
import SocialMedia from "./pages/SocialMedia";
import EmailCampaigns from "./pages/EmailCampaigns";
import Competitors from "./pages/Competitors";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="marketing-center-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/app" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/app/content" element={
                <ProtectedRoute>
                  <ContentCreator />
                </ProtectedRoute>
              } />
              <Route path="/app/social" element={
                <ProtectedRoute>
                  <SocialMedia />
                </ProtectedRoute>
              } />
              <Route path="/app/email" element={
                <ProtectedRoute>
                  <EmailCampaigns />
                </ProtectedRoute>
              } />
              <Route path="/app/competitors" element={
                <ProtectedRoute>
                  <Competitors />
                </ProtectedRoute>
              } />
              <Route path="/app/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/app/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/content" element={<Navigate to="/app/content" replace />} />
              <Route path="/social" element={<Navigate to="/app/social" replace />} />
              <Route path="/email" element={<Navigate to="/app/email" replace />} />
              <Route path="/competitors" element={<Navigate to="/app/competitors" replace />} />
              <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
              <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
