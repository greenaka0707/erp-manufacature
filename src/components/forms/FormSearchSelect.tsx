import { useEffect, useMemo, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface FormSearchSelectProps {
  label?: string;
  value?: string;
  options: Option[];
  onChange: (value: string) => void;
}

export default function FormSearchSelect({ label, value, options, onChange }: FormSearchSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Hanya satu deklarasi selectedLabel
  const selectedLabel = options.find((x) => x.value === value)?.label ?? "";

  useEffect(() => {
    if (!open) {
      setSearch(selectedLabel);
    }
  }, [selectedLabel, open]);

  const filteredOptions = useMemo(() => {
    return options.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  return (
    <div className="relative">
      {label && <label className="mb-1 block text-sm font-medium">{label}</label>}

      <input
        value={open ? search : selectedLabel} // pakai selectedLabel hanya di sini
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        placeholder={`Cari ${label ?? ""}...`}
        className="w-full rounded-lg border px-3 py-2"
      />

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
          {filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className="block w-full px-3 py-2 text-left hover:bg-gray-100"
              onClick={() => {
                onChange(option.value);
                setSearch(option.label);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
