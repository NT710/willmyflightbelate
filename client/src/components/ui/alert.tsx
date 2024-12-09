import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export const Alert: React.FC<AlertProps> = ({ children, variant = 'default' }) => {
  const baseStyles = "rounded-lg border p-4";
  const variantStyles = variant === 'destructive' 
    ? "border-red-200 bg-red-50 text-red-900" 
    : "border-gray-200 bg-gray-50";

  return (
    <div className={`${baseStyles} ${variantStyles}`}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h5 className="font-medium mb-1">{children}</h5>
);

export const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm">{children}</p>
);
