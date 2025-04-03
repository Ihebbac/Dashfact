import React from "react";
import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  // Check if the user is authenticated (e.g., by verifying the JWT)
  const isAuthenticated = () => {
    const token = localStorage.getItem("token"); // Retrieve the JWT from storage
    return true; // Return true if the token exists
  };

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated() ? (
          <Component {...props} /> // Render the requested component
        ) : (
          <Redirect to="/login" /> // Redirect to the sign-in page
        )
      }
    />
  );
};

export default ProtectedRoute;
