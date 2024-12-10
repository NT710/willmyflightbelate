// alert.tsx
import React from 'react';
import type { FC } from 'react';
import './alert.css'; // Assuming CSS for styling is present

type AlertProps = {
  message: string;
  type: 'success' | 'error' | 'info';
};

const Alert: FC<AlertProps> = ({ message, type }) => {
  const alertClass = `alert alert-${type}`;

  return (
    <div className={alertClass} role="alert">
      {message}
    </div>
  );
};

export default Alert;
