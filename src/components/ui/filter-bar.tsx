import { Search } from "lucide-react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 bg-card shadow-sm mb-4 p-3 border border-border rounded-xl", className)}>
      {children}
    </div>
  );
}

export function SearchInput({
  placeholder = "Rechercher...",
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="relative flex-1 min-w-50">
      <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="bg-background pr-3 pl-9 border border-border focus:border-primary rounded-lg outline-none focus:ring-2 focus:ring-primary/15 w-full h-9 text-sm"
      />
    </div>
  );
}

type SelectInputProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  children: ReactNode;
  onChange?: (v: string) => void;
};

export function SelectInput({ children, value, onChange, className, ...rest }: SelectInputProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn("bg-background px-3 border border-border focus:border-primary rounded-lg outline-none focus:ring-2 focus:ring-primary/15 h-9 text-sm", className)}
      {...rest}
    >
      {children}
    </select>
  );
}