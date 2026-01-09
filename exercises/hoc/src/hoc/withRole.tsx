import { memo, useMemo, type ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth.types";
import { Loading, AccessDenied } from "../components/UIComponents";
import { ErrorBoundary } from "../components/ErrorBoundary";

/**
 * Higher Order Component (HOC) that protects routes based on user role.
 *
 * Usage:
 * const AdminOnlyPanel = withRole(AdminPanel, ['admin']);
 * const AdminOrModeratorPanel = withRole(Panel, ['admin', 'moderator']);
 *
 * This HOC checks if:
 * 1. User is authenticated (if not, redirects to login)
 * 2. User has one of the required roles (if not, shows unauthorized message)
 *
 * Performance: Uses React.memo and useMemo to prevent unnecessary re-renders
 *
 * @param allowedRoles - Array of roles that are allowed to access the component
 */
export function withRole<P extends object>(
  Component: ComponentType<P>,
  allowedRoles: Role[]
) {
  const MemoizedComponent = memo(Component);

  const RoleProtectedComponent = memo(function RoleProtectedComponent(
    props: P
  ) {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Memoize role check to avoid recalculation on every render
    const hasRequiredRole = useMemo(() => {
      return user && allowedRoles.includes(user.role);
    }, [user?.role]);

    // Show loading state while checking authentication
    if (isLoading) {
      return <Loading />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (!hasRequiredRole) {
      return <AccessDenied requiredRoles={allowedRoles} userRole={user.role} />;
    }

    // User has required role, render the component with error boundary
    return (
      <ErrorBoundary>
        <MemoizedComponent {...props} />
      </ErrorBoundary>
    );
  });

  return RoleProtectedComponent;
}
