// alert.tsx
import { FC } from 'react';

type AlertProps = {
  message: string;
  type: 'success' | 'error' | 'info';
};

const Alert: FC<AlertProps> = ({ message, type }) => {
  const alertClass = `alert alert-${type}`;
  return <div className={alertClass}>{message}</div>;
};

export default Alert;
