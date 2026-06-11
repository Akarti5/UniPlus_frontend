import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  actif: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  archive: "bg-slate-100 text-slate-600 ring-slate-200",
  redoublant: "bg-purple-100 text-purple-700 ring-purple-200",
  redoublement: "bg-purple-100 text-purple-700 ring-purple-200",
  exclu: "bg-red-100 text-red-700 ring-red-200",
  exclusion: "bg-red-100 text-red-700 ring-red-200",
  diplome: "bg-blue-100 text-blue-700 ring-blue-200",
  admis: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  jury: "bg-amber-100 text-amber-700 ring-amber-200",
  en_attente: "bg-slate-100 text-slate-600 ring-slate-200",
  fondamentale: "bg-blue-100 text-blue-700 ring-blue-200",
  optionnelle: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  transversale: "bg-amber-100 text-amber-700 ring-amber-200",
  L: "bg-blue-100 text-blue-700 ring-blue-200",
  M: "bg-purple-100 text-purple-700 ring-purple-200",
  impair: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  pair: "bg-teal-100 text-teal-700 ring-teal-200",
  paye: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  impaye: "bg-amber-100 text-amber-700 ring-amber-200",
};

const labels: Record<string, string> = {
  actif: "Actif",
  archive: "Archivé",
  redoublant: "Redoublant",
  redoublement: "Redoublement",
  exclu: "Exclu",
  exclusion: "Exclusion",
  diplome: "Diplômé",
  admis: "Admis",
  jury: "Jury",
  en_attente: "En attente",
  fondamentale: "Fondamentale",
  optionnelle: "Optionnelle",
  transversale: "Transversale",
  impair: "Impair",
  pair: "Pair",
  paye: "Payé",
  impaye: "Impayé",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md ring-1 ring-inset font-medium text-xs",
        variants[status] ?? "bg-slate-100 text-slate-600 ring-slate-200",
        className,
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
