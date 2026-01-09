import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { useGetCurrentUserQuery } from "../features/auth/authApi";
import { useAppDispatch } from "../app/hooks";
import { setUser, logout } from "../features/auth/authSlice";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth
  );

  // Fetch current user if authenticated but user data not loaded
  const {
    data: user,
    error,
    isLoading,
  } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user, dispatch]);

  useEffect(() => {
    // If there's an authentication error, logout
    if (error && "status" in error && error.status === 401) {
      dispatch(logout());
    }
  }, [error, dispatch]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
