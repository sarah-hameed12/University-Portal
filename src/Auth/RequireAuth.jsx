// src/RequireAuth.jsx
import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";

// Accept the user object as a prop
const RequireAuth = ({ user }) => {
  const location = useLocation();

  if (!user) {
    // Redirect them to the /signin page, saving the current location
    // they were trying to access in state.state.from
    console.log("RequireAuth: No user found, redirecting to /signin");
    return <Navigate to="/signin" state={{ from: location }} replace />;
    // 'replace' prevents the protected route from being added to history
  }

  // If user exists, render the child route's element
  return <Outlet />;
};

export default RequireAuth;
