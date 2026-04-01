import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredRole?: "SYSTEM_ADMIN" | "HOTEL_ADMIN" | "HOTEL_SUB_ADMIN" | "user";
}

/**
 * ProtectedRoute component that checks authentication and role before rendering
 */
export const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  // No token = not authenticated
  if (!token) {
    if (requiredRole === "SYSTEM_ADMIN") {
      return <Navigate to="/admin-login" replace />;
    } else if (requiredRole === "HOTEL_ADMIN" || requiredRole === "HOTEL_SUB_ADMIN") {
      return <Navigate to="/hotel-admin-login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // Check role if required
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return element;
};
