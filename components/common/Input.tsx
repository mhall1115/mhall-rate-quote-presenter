import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  helperText?: string;
  leadingAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, helperText, leadingAddon, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          {leadingAddon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-400 sm:text-sm">{leadingAddon}</span>
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`block w-full rounded-md border-white/20 bg-white/5 text-white focus:border-aqua focus:ring-aqua sm:text-sm ${leadingAddon ? 'pl-7' : ''}`}
            {...props}
          />
        </div>
        {helperText && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}
      </div>
    );
  }
);
