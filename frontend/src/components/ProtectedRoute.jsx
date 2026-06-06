import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0A0E0D]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-\[#9A8678\]/30 border-t-\[#9A8678\] rounded-full animate-spin" />
          <p className="text-sm text-green-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
