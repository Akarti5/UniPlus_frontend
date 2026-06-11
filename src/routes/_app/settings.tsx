import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Paramètres — UniPlus" }] }),
  component: () => {
    const [tab, setTab] = useState<"profil" | "securite" | "systeme">("profil");
    const tabs = [
      { id: "profil", label: "Profil admin" },
      { id: "securite", label: "Sécurité" },
      { id: "systeme", label: "Système" },
    ] as const;
    const input = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

    return (
      <div>
        <PageHeader title="Paramètres" subtitle="Gérez votre compte et la configuration système" />
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-[220px_1fr]">
          <div className="bg-card shadow-sm p-2 border border-border rounded-xl">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex justify-between items-center px-3 py-2 rounded-lg w-full font-medium text-sm transition-colors",
                  tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span>{t.label}</span>
                {tab === t.id && <span>›</span>}
              </button>
            ))}
          </div>

          <div className="bg-card shadow-sm p-6 border border-border rounded-xl">
            {tab === "profil" && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar name="Admin Aziz" className="w-16 h-16 text-lg" />
                  <div>
                    <div className="font-semibold text-base">Admin Aziz</div>
                    <div className="text-muted-foreground text-sm">Administrateur · admin@univ.dz</div>
                    <Button variant="secondary" size="sm" className="mt-2">Changer la photo</Button>
                  </div>
                </div>
                <h3 className="mb-4 font-semibold text-base">Informations du profil</h3>
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  {/* ✅ htmlFor + id sur chaque paire label/input */}
                  <div>
                    <label htmlFor="admin-nom" className="font-medium text-muted-foreground text-xs">Nom</label>
                    <input id="admin-nom" className={`${input} mt-1.5`} defaultValue="Aziz" />
                  </div>
                  <div>
                    <label htmlFor="admin-prenom" className="font-medium text-muted-foreground text-xs">Prénom</label>
                    <input id="admin-prenom" className={`${input} mt-1.5`} defaultValue="Admin" />
                  </div>
                  <div>
                    <label htmlFor="admin-email" className="font-medium text-muted-foreground text-xs">Email</label>
                    <input id="admin-email" className={`${input} mt-1.5`} defaultValue="admin@univ.dz" />
                  </div>
                  <div>
                    <label htmlFor="admin-role" className="font-medium text-muted-foreground text-xs">Rôle</label>
                    <input id="admin-role" className={`${input} mt-1.5 bg-muted`} defaultValue="Administrateur" readOnly />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="secondary">Annuler</Button>
                  <Button>Enregistrer</Button>
                </div>
              </>
            )}

            {tab === "securite" && (
              <>
                <h3 className="mb-4 font-semibold text-base">Changer le mot de passe</h3>
                <div className="gap-4 grid grid-cols-1">
                  <div>
                    <label htmlFor="pwd-actuel" className="font-medium text-muted-foreground text-xs">Mot de passe actuel</label>
                    <input id="pwd-actuel" type="password" className={`${input} mt-1.5`} />
                  </div>
                  <div>
                    <label htmlFor="pwd-nouveau" className="font-medium text-muted-foreground text-xs">Nouveau mot de passe</label>
                    <input id="pwd-nouveau" type="password" className={`${input} mt-1.5`} />
                  </div>
                  <div>
                    <label htmlFor="pwd-confirm" className="font-medium text-muted-foreground text-xs">Confirmation</label>
                    <input id="pwd-confirm" type="password" className={`${input} mt-1.5`} />
                  </div>
                </div>
                <div className="flex justify-end mt-6"><Button>Mettre à jour</Button></div>
              </>
            )}

            {tab === "systeme" && (
              <>
                <h3 className="mb-4 font-semibold text-base">Informations système</h3>
                <div className="space-y-3 text-sm">
                  <Row label="Version" value="UniPlus v1.0" />
                  <Row label="Année active" value="2025-2026" />
                  <Row label="Total étudiants" value="247" />
                  <Row label="Total enseignants" value="88" />
                  <Row label="Total inscriptions" value="240" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-border last:border-0 border-b">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}