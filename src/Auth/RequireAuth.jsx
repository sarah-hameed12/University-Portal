// src/RequireAuth.jsx
import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";

// Accept the user object as a prop
const RequireAuth = ({ user }) => {
  const location = useLocation();

  if (!user) {
    console.log("RequireAuth: No user found, redirecting to /signin");
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
