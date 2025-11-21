import React from "react";

export interface ToggleButtonProps {
  /** Current state of the toggle */
  checked: boolean;
  /** Callback function when toggle is clicked */
  onChange: () => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Size variant of the toggle */
  size?: "sm" | "md" | "lg";
  /** Color variant when checked */
  variant?: "primary" | "success" | "warning" | "danger";
  /** Optional label */
  label?: string;
  /** Optional description */
  description?: string;
  /** Optional icon component to show before label */
  icon?: React.ReactNode;
}

const sizeClasses = {
  sm: {
    track: "w-8 h-4",
    thumb: "w-3 h-3",
    translate: "translate-x-4",
  },
  md: {
    track: "w-12 h-6",
    thumb: "w-5 h-5",
    translate: "translate-x-6",
  },
  lg: {
    track: "w-14 h-7",
    thumb: "w-6 h-6",
    translate: "translate-x-7",
  },
};

const variantClasses = {
  primary: "bg-blue-600",
  success: "bg-green-600",
  warning: "bg-yellow-600",
  danger: "bg-red-600",
};

export function ToggleButton({
  checked,
  onChange,
  disabled = false,
  size = "md",
  variant = "success",
  label,
  description,
  icon,
}: ToggleButtonProps) {
  const { track, thumb, translate } = sizeClasses[size];
  const activeColor = variantClasses[variant];

  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-750 rounded-lg p-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
    >
      <div className="flex items-center gap-3">
        {icon && <div className="shrink-0">{icon}</div>}
        <div className="text-left">
          {label && <p className="text-white font-medium">{label}</p>}
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
        </div>
      </div>
      <div
        className={`${track} rounded-full transition-colors ${
          checked ? activeColor : "bg-gray-600"
        }`}
      >
        <div
          className={`${thumb} bg-white rounded-full transition-transform transform ${
            checked ? translate : "translate-x-1"
          } mt-0.5`}
        ></div>
      </div>
    </button>
  );
}
