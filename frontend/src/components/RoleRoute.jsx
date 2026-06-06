import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ children, allowed }) {
  const { user } = useAuth();

  if (!user || !allowed.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
