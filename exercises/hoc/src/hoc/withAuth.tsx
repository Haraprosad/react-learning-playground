import { memo, type ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components/UIComponents";
import { ErrorBoundary } from "../components/ErrorBoundary";

/**
 * Higher Order Component (HOC) that protects routes requiring authentication.
 *
 * Usage:
 * const ProtectedDashboard = withAuth(Dashboard);
 *
 * This HOC checks if a user is authenticated. If not, it redirects to the login page.
 * If authenticated, it renders the wrapped component with error boundary protection.
 *
 * Performance: Uses React.memo to prevent unnecessary re-renders
 */
export function withAuth<P extends object>(Component: ComponentType<P>) {
  const MemoizedComponent = memo(Component);

  const AuthenticatedComponent = memo(function AuthenticatedComponent(
    props: P
  ) {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
      return <Loading />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Render the protected component with error boundary
    return (
      <ErrorBoundary>
        <MemoizedComponent {...props} />
      </ErrorBoundary>
    );
  });

  return AuthenticatedComponent;
}
