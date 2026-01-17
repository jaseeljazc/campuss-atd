import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { PageLoader } from "@/components/ui/loader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useEffect, useState } from "react";
import { apiService } from "./services/api";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { HODDashboard } from "./pages/HODDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirect authenticated users away from login
function LoginRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader message="Verifying session..." />;
  }

  if (isAuthenticated && user) {
    switch (user.role) {
      case "hod":
        return <Navigate to="/hod" replace />;
      case "teacher":
        return <Navigate to="/teacher" replace />;
      case "student":
        return <Navigate to="/student" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Login />;
}

// Redirect authenticated users away from signup
function SignupRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isAuthenticated && user) {
    switch (user.role) {
      case "hod":
        return <Navigate to="/hod" replace />;
      case "teacher":
        return <Navigate to="/teacher" replace />;
      case "student":
        return <Navigate to="/student" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Signup />;
}

// Redirect root to appropriate dashboard or login
function RootRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isAuthenticated && user) {
    switch (user.role) {
      case "hod":
        return <Navigate to="/hod" replace />;
      case "teacher":
        return <Navigate to="/teacher" replace />;
      case "student":
        return <Navigate to="/student" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Navigate to="/login" replace />;
}

function AppContent() {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  useEffect(() => {
    // Subscribe to API loader
    const unsubscribe = apiService.setLoadingListener((isLoading) => {
      setIsGlobalLoading(isLoading);
    });

    // We don't have a direct unsubscribe method in apiService yet that returns a function,
    // but setLoadingListener overwrites the listener.
    // Ideally apiService should support multiple listeners or we rewrite it.
    // For now, single listener is fine as this is the root app.

    return () => {
      apiService.setLoadingListener(() => {}); // clear listener on unmount
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" />
            {isGlobalLoading && <PageLoader message="Loading data..." />}
            <Routes>
              <Route path="/login" element={<LoginRedirect />} />
              <Route path="/signup" element={<SignupRedirect />} />
              <Route path="/" element={<RootRedirect />} />
              <Route
                path="/teacher/*"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hod/*"
                element={
                  <ProtectedRoute allowedRoles={["hod"]}>
                    <HODDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;
