import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface GatekeeperProps {
  children: React.ReactNode;
}

const Gatekeeper = ({ children }: GatekeeperProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default Gatekeeper;
