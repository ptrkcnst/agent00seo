import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "./LoadingSpinner";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="min-h-screen grid place-items-center"><LoadingSpinner /></div>;
  if (!session) return <Navigate to="/auth" replace state={{ from: loc.pathname }} />;
  return children;
}
