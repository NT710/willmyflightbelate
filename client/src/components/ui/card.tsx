import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card: React.FC<CardProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`}
      {...props}
    />
  );
};

export const CardHeader: React.FC<CardProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    />
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = "", ...props }) => {
  return (
    <h3
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  );
};

export const CardContent: React.FC<CardProps> = ({ className = "", ...props }) => {
  return (
    <div 
      className={`p-6 pt-0 ${className}`}
      {...props} 
    />
  );
};
