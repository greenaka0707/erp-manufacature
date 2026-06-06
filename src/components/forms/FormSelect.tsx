import type { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

export default function FormSelect({ label, options, error, ...props }: FormSelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>

      <select
        {...props}
        className="
          w-full
          rounded-lg
          border
          px-3
          py-2
          text-sm
          outline-none
        "
      >
        <option value="">Select...</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
