import { Navigate } from 'react-router-dom';
import { useAuthContext, UserRole, getDashboardForRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole | UserRole[];
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getDashboardForRole(currentUser.role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
