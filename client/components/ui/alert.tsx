import React from "react"

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  className?: string;
}

export const Alert = ({ children, variant = 'default', className = '' }: AlertProps) => (
  <div className={`rounded-lg border p-4 ${
    variant === 'destructive' ? 'border-red-200 bg-red-50 text-red-900' : 'border-gray-200 bg-gray-50'
  } ${className}`}>
    {children}
  </div>
)

export const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h5 className="font-medium text-sm mb-1">{children}</h5>
)

export const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600">{children}</p>
)
