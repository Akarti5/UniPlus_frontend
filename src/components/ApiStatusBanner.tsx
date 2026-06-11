import { AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/client";

export function ApiStatusBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex items-start gap-2 bg-amber-50 mb-4 px-3 py-2 border border-amber-300 rounded-lg text-amber-800 text-xs">
      <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0" />
      <div>
        <strong>API hors-ligne</strong> — affichage de données de démonstration.
        Vérifiez que le backend tourne sur <code className="font-mono">{API_BASE_URL}</code>.
      </div>
    </div>
  );
}