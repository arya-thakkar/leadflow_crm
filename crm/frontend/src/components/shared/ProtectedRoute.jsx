import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layers } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-700">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center shrink-0 animate-pulse">
            <Layers size={12} className="text-white" />
          </div>
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
