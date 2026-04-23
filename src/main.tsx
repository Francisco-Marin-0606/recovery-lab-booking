import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DemoProvider } from "./contexts/DemoContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import App from "./App";
import LoginPage from "./pages/LoginPage";
import "./index.css";

function AdminRoute() {
  const { profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!profile || !isAdmin) {
    return <LoginPage />;
  }

  return <App mode="admin" />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DemoProvider>
            <Routes>
              <Route path="/" element={<App mode="public" />} />
              <Route path="/admin" element={<AdminRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DemoProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
