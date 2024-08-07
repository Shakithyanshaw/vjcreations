import React from 'react';
import { Alert } from 'react-bootstrap';

// Component to display a dismissible notification message
const NotificationBox = ({ show, onClose, message }) => {
  if (!show) return null; // Do not render if show is false

  return (
    <Alert variant="info" onClose={onClose} dismissible>
      {message}
    </Alert>
  );
};

export default NotificationBox;
