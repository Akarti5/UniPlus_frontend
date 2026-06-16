import { createFileRoute } from "@tanstack/react-router";
import { Calculator, Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/stat-card";
import { FilterBar, SelectInput } from "@/components/ui/filter-bar";
import { DataTable, THead, TH, TR, TD } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge-status";
import { ApiStatusBanner } from "@/components/ApiStatusBanner";
import { useApiList } from "@/lib/api/use-api-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useRef } from "react";
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

const DECISION_LABELS: Record<string, string> = {
  admis: "Admis",
  redoublement: "Redoublement",
  exclusion: "Exclusion",
  jury: "Jury",
  en_attente: "En attente",
};

function ResultatsAnnuelPage() {
  const [selectedGroupeId, setSelectedGroupeId] = useState("");
  const [selectedAnneeId, setSelectedAnneeId] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);

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

  const resolvedAnneeId = selectedAnneeId || (annees as any[]).find((a: any) => a.actif)?.id;

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
            // leave undefined
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
      const b = (bulletins as any)[ins.id];
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

  const refetchAll = () => { refetch(); refetchBulletins(); };

  const calculerUn = useMutation({
    mutationFn: async (inscriptionId: number | string) => {
      if (!resolvedAnneeId) throw new Error("Sélectionnez une année scolaire");
      await inscriptionsApi.annualResult(inscriptionId, resolvedAnneeId);
      const bulletin = await reportsApi.bulletinAnnuel(inscriptionId, resolvedAnneeId) as any;
      return bulletin?.data ?? bulletin;
    },
    onSuccess: () => { toast.success("Résultats annuels calculés"); refetchAll(); },
    onError: (e: any) => toast.error(e?.message ?? "Erreur lors du calcul"),
  });

  const calculerTout = useMutation({
    mutationFn: async () => {
      if (!resolvedAnneeId) throw new Error("Sélectionnez une année scolaire");
      for (const r of rows) await inscriptionsApi.annualResult(r.id, resolvedAnneeId);
    },
    onSuccess: () => { toast.success("Tous les résultats annuels ont été recalculés"); refetchAll(); },
    onError: (e: any) => toast.error(e?.message ?? "Erreur lors du calcul global"),
  });

  const handlePrint = () => {
    const anneeLabel = (annees as any[]).find((a: any) => String(a.id) === selectedAnneeId)?.label ?? "Toutes les années";
    const groupeLabel = (groupes as any[]).find((g: any) => String(g.id) === selectedGroupeId)?.nom ?? "Tous les groupes";

    const tableRows = rows.map((r, i) => {
      const decisionText = DECISION_LABELS[r.decision] ?? r.decision;
      const finalColor = r.moyenneFinal != null && r.moyenneFinal >= 10 ? "#059669" : "#dc2626";
      return `
        <tr>
          <td>${i + 1}</td>
          <td class="mono">${r.matricule}</td>
          <td><strong>${r.etudiant}</strong></td>
          <td>${r.groupe || "—"}</td>
          <td class="center">${r.moyenneTheorique != null ? r.moyenneTheorique.toFixed(2) : "—"}</td>
          <td class="center">${r.moyennePratique != null ? r.moyennePratique.toFixed(2) : "—"}</td>
          <td class="center" style="font-weight:700;color:${finalColor}">${r.moyenneFinal != null ? `${r.moyenneFinal.toFixed(2)}/20` : "—"}</td>
          <td class="center">${decisionText}</td>
        </tr>`;
    }).join("");

    const summaryItems = tiles.map((t) =>
      `<span class="tile">${t.label} : <strong>${t.value}</strong></span>`
    ).join("");

    const printWindow = window.open("", "_blank", "width=1000,height=700");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Résultats annuels — UniPlus</title>
          <style>
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: system-ui, sans-serif; font-size: 12px; color: #111; padding: 24px; }
            h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
            .meta { color: #6b7280; font-size: 11px; margin-bottom: 16px; }
            .summary { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
            .tile { background: #f3f4f6; border-radius: 6px; padding: 4px 10px; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f9fafb; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #6b7280; padding: 7px 10px; text-align: left; border-bottom: 2px solid #e5e7eb; }
            td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; font-size: 11px; }
            tr:last-child td { border-bottom: none; }
            .center { text-align: center; }
            .mono { font-family: monospace; }
            .footer { margin-top: 24px; font-size: 10px; color: #9ca3af; text-align: right; }
            @media print { body { padding: 12px; } }
          </style>
        </head>
        <body>
          <h1>Résultats annuels — UniPlus</h1>
          <div class="meta">
            Année : ${anneeLabel} &nbsp;·&nbsp; Groupe : ${groupeLabel} &nbsp;·&nbsp;
            Édité le ${new Date().toLocaleDateString("fr-FR")} &nbsp;·&nbsp; ${rows.length} inscription(s)
          </div>
          <div class="summary">${summaryItems}</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Matricule</th>
                <th>Étudiant</th>
                <th>Groupe</th>
                <th class="center">Moy. théorique</th>
                <th class="center">Moy. pratique</th>
                <th class="center">Moy. finale</th>
                <th class="center">Décision</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="footer">UniPlus — généré automatiquement</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  return (
    <div>
      <PageHeader
        title="Résultats annuels"
        subtitle={`${rows.length} inscriptions`}
        actions={
          <>
            <Button variant="secondary" onClick={handlePrint} disabled={rows.length === 0}>
              <Printer className="w-4 h-4" />
              Imprimer
            </Button>
            <Button onClick={() => calculerTout.mutate()} disabled={calculerTout.isPending}>
              <Calculator className="w-4 h-4" />
              {calculerTout.isPending ? "Calcul en cours..." : "Tout calculer"}
            </Button>
          </>
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

      <div ref={tableRef}>
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
    </div>
  );
}