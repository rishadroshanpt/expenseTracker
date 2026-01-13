import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4"
            viewBox="0 0 50 50"
          >
            <circle
              className="opacity-30"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
            />
            <circle
              className="text-indigo-600"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
              strokeDasharray="100"
              strokeDashoffset="75"
            />
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
