// client/src/components/protection/UserProtection.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const UserProtection = ({ children }) => {
    const token = localStorage.getItem("jwtToken");
    const location = useLocation();

    if (!token) {
        // Redirect unauthenticated user to login while preserving target route in state
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default UserProtection;