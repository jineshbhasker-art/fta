import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-full">Verifying access...</div>;
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
