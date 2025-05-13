import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
    } else {
      setIsAuthenticated(true); 
    }
  }, [navigate]);

  return isAuthenticated ? children : null; 
};

export default ProtectedRoute;
