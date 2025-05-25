import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null; // Cargando

  return isSignedIn ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
