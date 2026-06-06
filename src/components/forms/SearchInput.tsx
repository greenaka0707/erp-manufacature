import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = "Search..." }: SearchInputProps) {
  return <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="max-w-sm" />;
}
