// client/src/components/protection/AdminProtection.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const AdminProtection = ({ children }) => {
    const token = localStorage.getItem("jwtToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
        return <Navigate to="/login/admin" replace />;
    }

    return children;
};

export default AdminProtection;