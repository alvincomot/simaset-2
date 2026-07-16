import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/auth/authContext';
import ForbiddenPage from './ForbiddenPage';

export const RoleGuard = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role, isLoading } = useAuth();


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
};

export default RoleGuard;
