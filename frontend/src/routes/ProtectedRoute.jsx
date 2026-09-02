import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route protégée — redirige vers /login si non authentifié
 * @param {string} requiredRole - 'ADMIN' ou 'USER' (optionnel)
 */
const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Rediriger vers le bon dashboard selon le rôle
    const redirectPath = user.role === 'ADMIN' ? '/dashboard-admin' : '/dashboard-user';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
