import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// This component acts like a "bouncer" at a club.
// If you are logged in (authenticated), it lets you pass to the page (children).
// If not, it kicks you out to the /login page.
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
