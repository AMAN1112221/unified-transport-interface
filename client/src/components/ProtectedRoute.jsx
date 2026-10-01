import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    localStorage.removeItem("user");
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let tokenPayload;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    tokenPayload = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")));

    if (!tokenPayload.exp || tokenPayload.exp * 1000 <= Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && (user?.role !== allowedRole || tokenPayload.role !== allowedRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;