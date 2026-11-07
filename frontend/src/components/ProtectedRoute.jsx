import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute() {
  const { user, loading, restoreError, retryRestore, logout } = useAuth();
  if (loading) return <div className="screen-loader">Loading TASKORA...</div>;
  if (restoreError) {
    return (
      <div className="screen-loader" role="alert">
        <p>{restoreError}</p>
        <button className="btn btn-primary" onClick={retryRestore}>Retry</button>
        <button className="btn btn-ghost" onClick={logout}>Sign out</button>
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}