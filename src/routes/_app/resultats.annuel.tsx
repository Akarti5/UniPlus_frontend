import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/stat-card";
import { FilterBar, SelectInput } from "@/components/ui/filter-bar";
import { DataTable, THead, TH, TR, TD } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge-status";
import { ApiStatusBanner } from "@/components/ApiStatusBanner";
import { useApiList } from "@/lib/api/use-api-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { inscriptionsApi, groupesApi, anneesApi, reportsApi } from "@/lib/api/endpoints";

interface ResultatAnnuel {
  id: number | string;
  matricule: string;
  etudiant: string;
  groupe: string;
  moyenneTheorique: number | null;
  moyennePratique: number | null;
  moyenneFinal: number | null;
  decision: string;
}

export const Route = createFileRoute("/_app/resultats/annuel")({
  head: () => ({ meta: [{ title: "Résultats annuels — UniPlus" }] }),
  component: ResultatsAnnuelPage,
});

function ResultatsAnnuelPage() {
  const [selectedGroupeId, setSelectedGroupeId] = useState("");
  const [selectedAnneeId, setSelectedAnneeId] = useState("");

  const { data: inscriptions, isFallback, refetch } = useApiList(
    ["inscriptions"],
    () => inscriptionsApi.list({ limit: 500 }),
  );

  const { data: groupes = [] } = useQuery({
    queryKey: ["groupes"],
    queryFn: async () => {
      const res = await groupesApi.list({ limit: 500 }) as any;
      return res?.data?.data ?? res?.data ?? [];
    },
  });

  const { data: annees = [] } = useQuery({
    queryKey: ["annees-scolaires"],
    queryFn: async () => {
      const res = await anneesApi.list({ limit: 100 }) as any;
      return res?.data?.data ?? res?.data ?? [];
    },
  });

  // Resolve the active annee id (selected or the one marked actif)
  const resolvedAnneeId = selectedAnneeId || (annees as any[]).find((a: any) => a.actif)?.id;

  // Fetch bulletin for every inscription to get computed averages
  const { refetch: refetchBulletins, data: bulletins = {} } = useQuery({
    queryKey: ["bulletins-annuels", resolvedAnneeId, (inscriptions as any[]).length],
    enabled: !!resolvedAnneeId && (inscriptions as any[]).length > 0,
    queryFn: async () => {
      const map: Record<string | number, any> = {};
      await Promise.allSettled(
        (inscriptions as any[]).map(async (ins: any) => {
          try {
            const res = await reportsApi.bulletinAnnuel(ins.id, resolvedAnneeId) as any;
            const d = res?.data?.data ?? res?.data ?? res;
            map[ins.id] = d;
          } catch {
            // leave undefined — averages will show "—"
          }
        }),
      );
      return map;
    },
  });

  const rows: ResultatAnnuel[] = (inscriptions as any[])
    .filter((ins: any) => {
      if (selectedGroupeId && String(ins.groupeId ?? ins.groupe?.id) !== selectedGroupeId) return false;
      if (selectedAnneeId && String(ins.anneeScolaireId ?? ins.anneeScolaire?.id) !== selectedAnneeId) return false;
      return true;
    })
    .map((ins: any) => {
      const b = (bulletins as any)[ins.id]; // enriched bulletin data
      return {
        id: ins.id,
        matricule: ins.etudiant?.matricule ?? b?.etudiant?.matricule ?? "",
        etudiant: [ins.etudiant?.prenom ?? b?.etudiant?.prenom, ins.etudiant?.nom ?? b?.etudiant?.nom].filter(Boolean).join(" "),
        groupe: ins.groupe?.nom ?? ins.groupe ?? b?.groupe ?? "",
        moyenneTheorique: b?.theoriqueAverage != null ? Number(b.theoriqueAverage) : null,
        moyennePratique: b?.practicalAverage != null ? Number(b.practicalAverage) : null,
        moyenneFinal: b?.finalAverage != null ? Number(b.finalAverage) : null,
        decision: b?.decision ?? ins.decision ?? ins.statut ?? "en_attente",
      };
    });

  const c = (decision: string) => rows.filter((r) => r.decision === decision).length;

  const tiles = [
    { label: "Admis", value: c("admis"), color: "bg-emerald-100 text-emerald-700" },
    { label: "Redoublement", value: c("redoublement"), color: "bg-purple-100 text-purple-700" },
    { label: "Exclusion", value: c("exclusion"), color: "bg-red-100 text-red-700" },
    { label: "Jury", value: c("jury"), color: "bg-amber-100 text-amber-700" },
    { label: "En attente", value: c("en_attente"), color: "bg-slate-100 text-slate-700" },
  ];

  const refetchAll = () => {
    refetch();
    refetchBulletins();
  };

  const calculerUn = useMutation({
    mutationFn: async (inscriptionId: number | string) => {
      if (!resolvedAnneeId) throw new Error("Sélectionnez une année scolaire");
      await inscriptionsApi.annualResult(inscriptionId, resolvedAnneeId);
      const bulletin = await reportsApi.bulletinAnnuel(inscriptionId, resolvedAnneeId) as any;
      return bulletin?.data ?? bulletin;
    },
    onSuccess: () => {
      toast.success("Résultats annuels calculés");
      refetchAll();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erreur lors du calcul"),
  });

  const calculerTout = useMutation({
    mutationFn: async () => {
      if (!resolvedAnneeId) throw new Error("Sélectionnez une année scolaire");
      for (const r of rows) {
        await inscriptionsApi.annualResult(r.id, resolvedAnneeId);
      }
    },
    onSuccess: () => {
      toast.success("Tous les résultats annuels ont été recalculés");
      refetchAll();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erreur lors du calcul global"),
  });

  return (
    <div>
      <PageHeader
        title="Résultats annuels"
        subtitle={`${rows.length} inscriptions`}
        actions={
          <Button onClick={() => calculerTout.mutate()} disabled={calculerTout.isPending}>
            <Calculator className="w-4 h-4" />
            {calculerTout.isPending ? "Calcul en cours..." : "Tout calculer"}
          </Button>
        }
      />

      <ApiStatusBanner show={isFallback} />

      <div className="gap-3 grid grid-cols-2 sm:grid-cols-5 mb-6">
        {tiles.map((t) => (
          <div key={t.label} className="bg-card shadow-sm p-4 border border-border rounded-xl">
            <div className={`mb-2 inline-flex h-7 items-center rounded-md px-2 text-xs font-semibold ${t.color}`}>
              {t.label}
            </div>
            <div className="font-bold text-3xl">{t.value}</div>
          </div>
        ))}
      </div>

      <FilterBar>
        <SelectInput value={selectedGroupeId} onChange={setSelectedGroupeId} title="Filtrer par groupe">
          <option value="">Tous les groupes</option>
          {(groupes as any[]).map((g: any) => (
            <option key={g.id} value={String(g.id)}>{g.nom}</option>
          ))}
        </SelectInput>

        <SelectInput value={selectedAnneeId} onChange={setSelectedAnneeId} title="Filtrer par année">
          <option value="">Toutes les années</option>
          {(annees as any[]).map((a: any) => (
            <option key={a.id} value={String(a.id)}>{a.label}</option>
          ))}
        </SelectInput>
      </FilterBar>

      <DataTable>
        <THead>
          <TR>
            <TH>#</TH>
            <TH>Matricule</TH>
            <TH>Étudiant</TH>
            <TH>Groupe</TH>
            <TH>Moy. théorique</TH>
            <TH>Moy. pratique</TH>
            <TH>Moy. finale</TH>
            <TH>Décision</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <tbody>
          {rows.map((r) => (
            <TR key={r.id}>
              <TD className="text-muted-foreground">{r.id}</TD>
              <TD className="font-mono text-xs">{r.matricule}</TD>
              <TD className="font-medium">{r.etudiant}</TD>
              <TD>{r.groupe || "—"}</TD>
              <TD>{r.moyenneTheorique != null ? r.moyenneTheorique.toFixed(2) : "—"}</TD>
              <TD>{r.moyennePratique != null ? r.moyennePratique.toFixed(2) : "—"}</TD>
              <TD className={r.moyenneFinal != null && r.moyenneFinal >= 10 ? "font-bold text-emerald-600" : "font-bold text-danger"}>
                {r.moyenneFinal != null ? `${r.moyenneFinal.toFixed(2)}/20` : "—"}
              </TD>
              <TD><StatusBadge status={r.decision} /></TD>
              <TD>
                <div className="flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => calculerUn.mutate(r.id)} disabled={calculerUn.isPending}>
                    <Calculator className="mr-1 w-3 h-3" />
                    Calculer
                  </Button>
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}