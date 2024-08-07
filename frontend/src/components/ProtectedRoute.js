import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../Store';

// Component to protect routes from unauthorized access
export default function ProtectedRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;

  // If user is authenticated, render children components, otherwise redirect to sign-in page
  return userInfo ? children : <Navigate to="signin" />;
}
