import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardUser from './pages/DashboardUser';
import DashboardRecettes from './pages/DashboardRecettes';
import ChoixDashboardPage from './pages/ChoixDashboardPage';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Page d'accueil publique */}
          <Route path="/" element={<HomePage />} />

          {/* Auth publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Dashboard Admin */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          </Route>

          {/* Espace User : écran de choix + les 2 dashboards indépendants */}
          <Route element={<ProtectedRoute />}>
            <Route path="/user/choix" element={<ChoixDashboardPage />} />
            <Route path="/user/dashboard" element={<DashboardUser />} />
            <Route path="/user/recettes" element={<DashboardRecettes />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />


        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );

}

export default App;
