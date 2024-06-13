import React from 'react';
import { Alert } from 'react-bootstrap';

const NotificationBox = ({ show, onClose, message }) => {
  if (!show) return null;

  return (
    <Alert variant="info" onClose={onClose} dismissible>
      {message}
    </Alert>
  );
};

export default NotificationBox;
