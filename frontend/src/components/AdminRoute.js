import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../Store';

// Component to restrict access to admin users
export default function AdminRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  // If the user is an admin, render the children components
  // Otherwise, redirect to the "signin" page
  return userInfo && userInfo.isAdmin ? children : <Navigate to="signin" />;
}
