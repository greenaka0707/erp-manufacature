import type { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FormInput({ label, error, className = "", ...props }: FormInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>

      <input
        {...props}
        className={`
          w-full
          rounded-lg
          border
          px-3
          py-2
          text-sm
          outline-none
          ${className}
        `}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
