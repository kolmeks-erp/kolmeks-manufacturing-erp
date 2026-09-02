import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRoleName } from '../../types';
import { ERP_BASE_PATH } from '../../constants/navigation';
import { UnauthorizedPage } from '../../pages/erp/UnauthorizedPage';
import { KolmeksLogo } from '../ui/KolmeksLogo';

interface ProtectedRouteProps {
  allowedRoles?: UserRoleName[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { session, user, profile, role, isLoading, signOut } = useAuth();
  const location = useLocation();

  // 1. Session Initialization State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1E36] flex flex-col items-center justify-center p-4 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <KolmeksLogo variant="dark-bg" size="sm" />
        </div>
        <p className="text-slate-400 text-sm animate-pulse">Checking secure session...</p>
      </div>
    );
  }

  // 2. Unauthenticated User Check -> Redirect to Login
  if (!session || !user || !profile) {
    return <Navigate to={`${ERP_BASE_PATH}/login`} state={{ from: location }} replace />;
  }

  // 3. User Status Check (Inactive / Suspended)
  if (profile.status !== 'active') {
    return (
      <div className="min-h-screen bg-[#0B1E36] flex flex-col items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-[#0F2C59] border border-red-500/30 rounded-lg p-6 text-center shadow-xl">
          <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Account Inactive</h2>
          <p className="text-slate-300 text-sm mb-6">
            Your ERP staff profile status is currently marked as{' '}
            <span className="font-semibold text-red-400 uppercase">{profile.status}</span>. Please contact your system
            administrator to reactivate your access.
          </p>
          <button
            onClick={() => signOut()}
            className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium text-sm transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // 4. Role Authorization Check
  if (allowedRoles && allowedRoles.length > 0 && role) {
    const isMasterAdmin = role === 'admin' || role === 'master_admin';
    if (!isMasterAdmin && !allowedRoles.includes(role)) {
      return <UnauthorizedPage />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
