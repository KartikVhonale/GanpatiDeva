import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';

export default function ProtectedRoute({ children, requireRole }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 animate-pulse">
          <span className="text-3xl">🪔</span>
        </div>
        <p className="text-amber-200 text-sm font-medium animate-pulse">
          माहिती पडताळणी सुरू आहे... (Verifying access...)
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role requires admin and user is not admin
  if (requireRole === 'admin' && user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 rounded-3xl border border-red-500/30 bg-gradient-to-b from-red-950/70 via-orange-950/50 to-black/80 backdrop-blur-xl text-center shadow-2xl space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 border border-red-400/40 text-red-400">
          <ShieldAlert className="h-9 w-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">
            प्रवेश प्रतिबंधित (Restricted Access)
          </h2>
          <p className="text-sm text-orange-200/80 leading-relaxed">
            हा विभाग केवळ <strong>मुख्य व्यवस्थापकांसाठी (Admin)</strong> राखीव आहे. आपण सध्या <strong className="text-amber-300">{user?.name}</strong> (स्वयंसेवक) म्हणून लॉग इन आहात.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/volunteer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-600/30 hover:brightness-110 transition-all"
          >
            <UserCheck className="h-4 w-4" />
            <span>स्वयंसेवक कक्षात जा</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-orange-950/40 px-5 py-2.5 text-xs font-bold text-amber-200 hover:bg-orange-900/40 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>मुख्य पृष्ठ</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
