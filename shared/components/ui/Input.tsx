import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      fullWidth = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputBaseClasses =
      "bg-gray-800 border text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all";
    const inputBorderClasses = error
      ? "border-red-500 focus:ring-red-500/50"
      : "border-gray-700 focus:ring-blue-500/50 focus:border-blue-500";
    const inputWidthClass = fullWidth ? "w-full" : "";

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${inputBaseClasses} ${inputBorderClasses} ${inputWidthClass} ${
              icon ? "pl-10" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-gray-400 text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
