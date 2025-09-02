import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, children, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <select
          id={id}
          ref={ref}
          className="mt-1 block w-full rounded-md border-white/20 bg-slate-800/60 py-2 pl-3 pr-10 text-base text-white focus:border-aqua focus:outline-none focus:ring-aqua sm:text-sm"
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);
