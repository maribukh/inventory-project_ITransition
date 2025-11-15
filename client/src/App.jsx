import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "./hooks/useLanguage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import EditInventoryPage from "./pages/EditInventoryPage";
import AdminPage from "./pages/AdminPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* V-- ДОБАВЛЕННЫЙ МАРШРУТ --V */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            {/* ^-- ДОБАВЛЕННЫЙ МАРШРУТ --^ */}
            <Route
              path="/inventory/:id"
              element={
                <ProtectedRoute>
                  <InventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/:id/edit"
              element={
                <ProtectedRoute>
                  <EditInventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </LanguageProvider>
  );
}

export default App;
