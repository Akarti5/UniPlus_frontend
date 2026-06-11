import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-emerald-100 text-emerald-600",
  purple: "bg-purple-100 text-purple-600",
  orange: "bg-amber-100 text-amber-600",
  indigo: "bg-indigo-100 text-indigo-600",
  teal: "bg-teal-100 text-teal-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
};

export function StatCard({
  label, value, icon: Icon, color = "blue", trend,
}: { label: string; value: string | number; icon: LucideIcon; color?: keyof typeof colorMap; trend?: { value: string; up?: boolean } }) {
  return (
    <div className="bg-card shadow-sm p-5 border border-border rounded-xl">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{label}</div>
          <div className="mt-2 font-bold text-foreground text-3xl">{value}</div>
          {trend && (
            <div className={cn("mt-1 font-medium text-xs", trend.up ? "text-emerald-600" : "text-rose-600")}>
              {trend.up ? "↑" : "↓"} {trend.value}
            </div>
          )}
        </div>
        <div className={cn("flex justify-center items-center rounded-lg w-11 h-11", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export function Button({
  children, variant = "primary", size = "md", className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"ghost"|"danger"; size?: "sm"|"md" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20",
    secondary: "border border-border bg-card text-foreground hover:bg-muted",
    ghost: "text-foreground hover:bg-muted",
    danger: "bg-danger text-white hover:bg-danger/90",
  };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-9 px-4 text-sm" };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
