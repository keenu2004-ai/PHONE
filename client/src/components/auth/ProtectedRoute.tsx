import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
        <div className="text-sm font-semibold text-gray-500">Verifying session security...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
