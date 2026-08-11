import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

interface AdminProtectedRouteProps {
  children: React.ReactElement;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { currentUser, isLoading } = useUserStore();

  if (isLoading && !currentUser) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Verifying user authorization privileges...
      </div>
    );
  }

  if (currentUser?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
