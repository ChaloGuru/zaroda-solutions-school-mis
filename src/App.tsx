import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import Elections from "./pages/Elections";
import Sports from "./pages/Sports";
import SuperAdmin from "./pages/SuperAdmin";
import Dashboard from "./pages/Dashboard";
import HoiDashboard from "./pages/hoi/HoiDashboard";
import DhoiDashboard from "./pages/dhoi/DhoiDashboard";
import HodDashboard from "./pages/hod/HodDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const forceTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    forceTop();
    const frameId = window.requestAnimationFrame(forceTop);
    const timeoutId = window.setTimeout(forceTop, 0);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [location.key]);

  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/elections" element={<Elections />} />
            <Route path="/sports" element={<Sports />} />
            <Route
              path="/superadmin-dashboard"
              element={
                <ProtectedRoute allowedRole="superadmin">
                  <SuperAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute allowedRole={["teacher", "hoi", "dhoi"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hoi-dashboard"
              element={
                <ProtectedRoute allowedRole="hoi">
                  <HoiDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dhoi-dashboard"
              element={
                <ProtectedRoute allowedRole="dhoi">
                  <DhoiDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod-dashboard"
              element={
                <ProtectedRoute allowedRole="hod">
                  <HodDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent-dashboard"
              element={
                <ProtectedRoute allowedRole="parent">
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<Navigate to="/login" replace />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />
            <Route path="/admin-login" element={<Navigate to="/login" replace />} />
            <Route path="/super-admin" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
