import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-slate-900/40 backdrop-blur-lg border border-white/10 shadow-lg rounded-xl p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};
