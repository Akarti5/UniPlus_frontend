import { createFileRoute } from "@tanstack/react-router";
import { Printer, FileDown, GraduationCap, Plus, Loader } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/stat-card";
import { FilterBar, SelectInput } from "@/components/ui/filter-bar";
import { ApiStatusBanner } from "@/components/ApiStatusBanner";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { inscriptionsApi, anneesApi, reportsApi } from "@/lib/api/endpoints";
import type { AnneeScolaireSemestre } from "@/lib/lmd";

export const Route = createFileRoute("/_app/reports/bulletin")({
  head: () => ({ meta: [{ title: "Bulletins — UniPlus" }] }),
  component: BulletinPage,
});

type Mode = "semestriel" | "annuel";

function BulletinPage() {
  const [mode, setMode] = useState<Mode>("semestriel");
  const [selectedInscriptionId, setSelectedInscriptionId] = useState("");
  const [selectedCalendarSemestreId, setSelectedCalendarSemestreId] = useState("");
  const [selectedSemestreS1Id, setSelectedSemestreS1Id] = useState("");
  const [selectedSemestreS2Id, setSelectedSemestreS2Id] = useState("");
  const [bulletin, setBulletin] = useState<any>(null);
  const [bulletinAnnuel, setBulletinAnnuel] = useState<{ s1: any; s2: any } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: inscriptions = [], isFallback } = useQuery({
    queryKey: ["inscriptions"],
    queryFn: async () => {
      const res = await inscriptionsApi.list({ limit: 500 }) as any;
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

  const activeAnneeId = (annees as any[]).find((a) => a.actif)?.id ?? (annees as any[])[0]?.id;

  const { data: calendarSemestres = [] } = useQuery({
    queryKey: ["annee-semestres", activeAnneeId],
    queryFn: async () => {
      if (!activeAnneeId) return [];
      const res = await anneesApi.listSemestres(activeAnneeId) as any;
      return (res?.data ?? res ?? []) as AnneeScolaireSemestre[];
    },
    enabled: !!activeAnneeId,
  });

  useEffect(() => {
    if (!selectedInscriptionId && inscriptions.length > 0) {
      setSelectedInscriptionId(String(inscriptions[0].id));
    }
    if (calendarSemestres.length > 0) {
      const sorted = [...calendarSemestres].sort((a, b) =>
        (a.semestre?.numero ?? 0) - (b.semestre?.numero ?? 0)
      );
      if (!selectedCalendarSemestreId) {
        const active = calendarSemestres.find((s) => s.actif) ?? calendarSemestres[0];
        setSelectedCalendarSemestreId(String(active.id));
      }
      if (!selectedSemestreS1Id && sorted[0]) setSelectedSemestreS1Id(String(sorted[0].id));
      if (!selectedSemestreS2Id && sorted[1]) setSelectedSemestreS2Id(String(sorted[1].id));
    }
  }, [inscriptions, calendarSemestres, selectedInscriptionId, selectedCalendarSemestreId, selectedSemestreS1Id, selectedSemestreS2Id]);

  // Reset bulletin when mode changes
  useEffect(() => {
    setBulletin(null);
    setBulletinAnnuel(null);
  }, [mode]);

  const handleGenerer = async () => {
    if (!selectedInscriptionId) {
      toast.error("Sélectionnez une inscription");
      return;
    }

    if (mode === "semestriel") {
      if (!selectedCalendarSemestreId) {
        toast.error("Sélectionnez un semestre");
        return;
      }
      try {
        const res = await reportsApi.bulletinSemestre(selectedInscriptionId, selectedCalendarSemestreId) as any;
        setBulletin(res?.data ?? res);
        setBulletinAnnuel(null);
        toast.success("Bulletin chargé");
      } catch (e: any) {
        toast.error(e?.message ?? "Impossible de charger le bulletin");
      }
    } else {
      if (!selectedSemestreS1Id || !selectedSemestreS2Id) {
        toast.error("Sélectionnez S1 et S2");
        return;
      }
      try {
        const [resS1, resS2] = await Promise.all([
          reportsApi.bulletinSemestre(selectedInscriptionId, selectedSemestreS1Id) as any,
          reportsApi.bulletinSemestre(selectedInscriptionId, selectedSemestreS2Id) as any,
        ]);
        setBulletinAnnuel({ s1: resS1?.data ?? resS1, s2: resS2?.data ?? resS2 });
        setBulletin(null);
        toast.success("Bulletins annuels chargés");
      } catch (e: any) {
        toast.error(e?.message ?? "Impossible de charger les bulletins");
      }
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Bulletin — UniPlus</title>
          <style>
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: system-ui, sans-serif; font-size: 13px; color: #111; padding: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { padding: 6px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; }
            th { background: #f9fafb; font-weight: 600; text-transform: uppercase; font-size: 10px; color: #6b7280; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-mono { font-family: monospace; }
            .text-danger { color: #dc2626; }
            .text-emerald-600 { color: #059669; }
            .text-primary { color: #2563eb; }
            .text-muted-foreground { color: #6b7280; }
            .border-b-2 { border-bottom: 2px solid #2563eb; }
            .rounded-lg { border-radius: 8px; }
            .overflow-hidden { overflow: hidden; }
            .border { border: 1px solid #e5e7eb; }
            .space-y-5 > * + * { margin-top: 20px; }
            .bg-primary\\/5, .bg-muted\\/30, .bg-muted\\/40 { background: #f8fafc; }
            .ue-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; background: #eff6ff; }
            .summary { display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 2px solid #2563eb; border-radius: 8px; margin-top: 24px; }
            .decision-badge { display: inline-flex; align-items: center; border-radius: 8px; padding: 6px 16px; font-weight: 700; font-size: 15px; }
            .admis { background: #d1fae5; color: #065f46; }
            .ajourn { background: #fee2e2; color: #991b1b; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #2563eb; }
            .annuel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
            .semester-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
            .semester-card h3 { font-size: 13px; font-weight: 700; margin-bottom: 8px; color: #2563eb; }
            @media print { body { padding: 12px; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  const handleExportPDF = () => toast.success("Export PDF — à intégrer");

  // ── Annuel computed values ──────────────────────────────────────────────────
  const moyS1 = bulletinAnnuel?.s1?.moyenneGenerale ?? 0;
  const moyS2 = bulletinAnnuel?.s2?.moyenneGenerale ?? 0;
  const moyAnnuelle = (moyS1 + moyS2) / 2;
  const decisionAnnuelle = moyAnnuelle >= 9.5 ? "ADMIS" : "REDOUBLEMENT";
  const admisAnnuel = moyAnnuelle >= 9.5;

  // ── Semestriel computed values ──────────────────────────────────────────────
  const etu = bulletin?.etudiant ?? bulletinAnnuel?.s1?.etudiant;
  const semLabel = bulletin?.semestre?.code ?? (bulletin?.semestre?.numero ? `S${bulletin.semestre.numero}` : "—");
  const moy = bulletin?.moyenneGenerale ?? 0;
  const admis = moy >= 10;

  const hasResult = !!bulletin || !!bulletinAnnuel;

  return (
    <>
      <div>
        <PageHeader
          title="Bulletin de notes"
          subtitle="Génération d'un bulletin semestriel ou annuel"
          actions={
            <>
              <Button variant="secondary" onClick={handleExportPDF} disabled={!hasResult}>
                <FileDown className="w-4 h-4" /> Exporter PDF
              </Button>
              <Button onClick={handlePrint} disabled={!hasResult}>
                <Printer className="w-4 h-4" /> Imprimer
              </Button>
            </>
          }
        />

        <ApiStatusBanner show={isFallback} />

        {/* Mode toggle */}
        <div className="inline-flex bg-muted p-1 rounded-lg mb-4">
          <button
            onClick={() => setMode("semestriel")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "semestriel" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Semestriel
          </button>
          <button
            onClick={() => setMode("annuel")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "annuel" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Annuel (S1 + S2)
          </button>
        </div>

        <FilterBar>
          <SelectInput value={selectedInscriptionId} onChange={setSelectedInscriptionId} aria-label="Inscription">
            {(inscriptions as any[]).map((ins) => {
              const name = [ins.etudiant?.prenom, ins.etudiant?.nom].filter(Boolean).join(" ");
              const mat = ins.etudiant?.matricule ?? "";
              return <option key={ins.id} value={ins.id}>{name || `#${ins.id}`} — {mat}</option>;
            })}
          </SelectInput>

          {mode === "semestriel" ? (
            <SelectInput value={selectedCalendarSemestreId} onChange={setSelectedCalendarSemestreId} aria-label="Semestre">
              {calendarSemestres.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.semestre?.code ?? `S${s.semestre?.numero}`}
                </option>
              ))}
            </SelectInput>
          ) : (
            <>
              <SelectInput value={selectedSemestreS1Id} onChange={setSelectedSemestreS1Id} aria-label="Semestre S1">
                <option value="">— S1 —</option>
                {calendarSemestres.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.semestre?.code ?? `S${s.semestre?.numero}`}
                  </option>
                ))}
              </SelectInput>
              <SelectInput value={selectedSemestreS2Id} onChange={setSelectedSemestreS2Id} aria-label="Semestre S2">
                <option value="">— S2 —</option>
                {calendarSemestres.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.semestre?.code ?? `S${s.semestre?.numero}`}
                  </option>
                ))}
              </SelectInput>
            </>
          )}

          <Button size="sm" onClick={handleGenerer}>
            <Plus className="w-4 h-4" /> Générer
          </Button>
        </FilterBar>

        {!hasResult ? (
          <div className="flex justify-center items-center mt-12 text-muted-foreground">
            <Loader className="mr-2 w-5 h-5 opacity-50" />
            Sélectionnez une inscription et cliquez sur Générer
          </div>
        ) : mode === "semestriel" && bulletin ? (
          // ── SEMESTRIEL VIEW ────────────────────────────────────────────────
          <div ref={printRef} className="bg-card shadow-sm print:shadow-none mt-6 p-8 border border-border rounded-xl">
            <BulletinHeader anneeScolaire={bulletin.anneeScolaire} />
            <div className="gap-4 grid grid-cols-2 bg-muted/40 mb-6 p-4 rounded-lg text-sm">
              <div><span className="text-muted-foreground">Étudiant :</span> <strong>{etu?.prenom} {etu?.nom}</strong></div>
              <div><span className="text-muted-foreground">Matricule :</span> <strong className="font-mono">{etu?.matricule}</strong></div>
              <div><span className="text-muted-foreground">Filière :</span> <strong>{bulletin.filiere}</strong></div>
              <div><span className="text-muted-foreground">Groupe :</span> <strong>{bulletin.groupe}</strong></div>
              <div><span className="text-muted-foreground">Semestre :</span> <strong>{semLabel}</strong></div>
              <div><span className="text-muted-foreground">Niveau :</span> <strong>{bulletin.niveauCode}</strong></div>
            </div>
            <UETable ueResults={bulletin.ueResults ?? []} />
            <SummaryBar moy={moy} label={admis ? "ADMIS" : "AJOURNÉ"} admis={admis} decision={bulletin.decision} />
          </div>
        ) : mode === "annuel" && bulletinAnnuel ? (
          // ── ANNUEL VIEW ───────────────────────────────────────────────────
          <div ref={printRef} className="bg-card shadow-sm print:shadow-none mt-6 p-8 border border-border rounded-xl">
            <BulletinHeader anneeScolaire={bulletinAnnuel.s1?.anneeScolaire} subtitle="Bulletin académique annuel" />

            <div className="gap-4 grid grid-cols-2 bg-muted/40 mb-6 p-4 rounded-lg text-sm">
              <div><span className="text-muted-foreground">Étudiant :</span> <strong>{etu?.prenom} {etu?.nom}</strong></div>
              <div><span className="text-muted-foreground">Matricule :</span> <strong className="font-mono">{etu?.matricule}</strong></div>
              <div><span className="text-muted-foreground">Filière :</span> <strong>{bulletinAnnuel.s1?.filiere}</strong></div>
              <div><span className="text-muted-foreground">Groupe :</span> <strong>{bulletinAnnuel.s1?.groupe}</strong></div>
              <div><span className="text-muted-foreground">Niveau :</span> <strong>{bulletinAnnuel.s1?.niveauCode}</strong></div>
            </div>

            {/* Side-by-side semester results */}
            <div className="gap-6 grid grid-cols-2 mb-8">
              <div>
                <h3 className="mb-3 pb-2 border-primary border-b font-bold text-primary text-sm uppercase tracking-wider">
                  Semestre 1
                </h3>
                <UETable ueResults={bulletinAnnuel.s1?.ueResults ?? []} compact />
                <div className="bg-primary/5 mt-3 px-4 py-2.5 border border-primary/20 rounded-lg text-sm">
                  <span className="text-muted-foreground">Moyenne S1 : </span>
                  <span className={`font-bold text-lg ${moyS1 >= 10 ? "text-emerald-600" : "text-red-600"}`}>
                    {moyS1.toFixed(2)}/20
                  </span>
                </div>
              </div>
              <div>
                <h3 className="mb-3 pb-2 border-primary border-b font-bold text-primary text-sm uppercase tracking-wider">
                  Semestre 2
                </h3>
                <UETable ueResults={bulletinAnnuel.s2?.ueResults ?? []} compact />
                <div className="bg-primary/5 mt-3 px-4 py-2.5 border border-primary/20 rounded-lg text-sm">
                  <span className="text-muted-foreground">Moyenne S2 : </span>
                  <span className={`font-bold text-lg ${moyS2 >= 10 ? "text-emerald-600" : "text-red-600"}`}>
                    {moyS2.toFixed(2)}/20
                  </span>
                </div>
              </div>
            </div>

            {/* Annual summary */}
            <div className="bg-primary/5 p-5 border-2 border-primary rounded-lg">
              <div className="mb-3 pb-3 border-primary/20 border-b text-muted-foreground text-xs uppercase tracking-wider">
                Récapitulatif annuel — (Moy. S1 + Moy. S2) ÷ 2
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wider">Moyenne annuelle</div>
                  <div className="mt-1 font-bold text-primary text-4xl">
                    {moyAnnuelle.toFixed(2)} <span className="text-muted-foreground text-lg">/ 20</span>
                  </div>
                  <div className="mt-2 text-muted-foreground text-xs">
                    ({moyS1.toFixed(2)} + {moyS2.toFixed(2)}) ÷ 2 = {moyAnnuelle.toFixed(2)} — seuil : 9,50
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-xs uppercase tracking-wider">Décision annuelle</div>
                  <div className={`mt-1 inline-flex items-center rounded-lg px-4 py-2 text-lg font-bold ${admisAnnuel ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"}`}>
                    {decisionAnnuelle}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function BulletinHeader({ anneeScolaire, subtitle }: { anneeScolaire?: string; subtitle?: string }) {
  return (
    <div className="flex justify-between items-center mb-6 pb-5 border-primary border-b-2">
      <div className="flex items-center gap-3">
        <div className="relative flex justify-center items-center bg-primary rounded-lg w-12 h-12 text-white">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-xl">UNIVERSITÉ — UniPlus</div>
          <div className="text-muted-foreground text-xs uppercase tracking-wider">
            {subtitle ?? "Bulletin académique semestriel"}
          </div>
        </div>
      </div>
      <div className="text-muted-foreground text-xs text-right">
        <div>Année : {anneeScolaire}</div>
        <div>Édité le {new Date().toLocaleDateString("fr-FR")}</div>
      </div>
    </div>
  );
}

function UETable({ ueResults, compact = false }: { ueResults: any[]; compact?: boolean }) {
  return (
    <div className="space-y-5">
      {ueResults.map((ue: any) => (
        <div key={ue.ueCode ?? ue.ue} className="border border-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center bg-primary/5 px-4 py-2.5">
            <div className="font-semibold text-sm">
              UE : {ue.ue}
              {!compact && <span className="font-normal text-muted-foreground text-xs"> ({ue.typeUe} — {ue.credits} ECTS)</span>}
            </div>
            <div className="font-bold text-primary text-sm">Moy : {ue.moyenne?.toFixed(2)}/20</div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-border border-b">
              <tr>
                <th className="px-4 py-2 font-semibold text-muted-foreground text-xs text-left uppercase">Matière</th>
                {!compact && <th className="px-4 py-2 font-semibold text-muted-foreground text-xs text-center uppercase">Coef</th>}
                <th className="px-4 py-2 font-semibold text-muted-foreground text-xs text-center uppercase">Normale</th>
                <th className="px-4 py-2 font-semibold text-muted-foreground text-xs text-center uppercase">Rattrap.</th>
                <th className="px-4 py-2 font-semibold text-muted-foreground text-xs text-center uppercase">Finale</th>
              </tr>
            </thead>
            <tbody>
              {(ue.matieres ?? []).map((m: any) => (
                <tr key={m.code} className="border-border last:border-0 border-b">
                  <td className="px-4 py-2 font-medium text-xs">{m.matiere}</td>
                  {!compact && <td className="px-4 py-2 text-center">{m.coefficient}</td>}
                  <td className="px-4 py-2 text-center">{m.noteNormale?.toFixed(2) ?? "—"}</td>
                  <td className="px-4 py-2 text-center">{m.noteRattrapage?.toFixed(2) ?? "—"}</td>
                  <td className={`px-4 py-2 text-center font-bold ${(m.noteFinale ?? 0) < 10 ? "text-danger" : "text-emerald-600"}`}>
                    {m.noteFinale?.toFixed(2) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function SummaryBar({ moy, label, admis, decision }: { moy: number; label: string; admis: boolean; decision?: string }) {
  return (
    <div className="bg-primary/5 mt-8 p-5 border-2 border-primary rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-muted-foreground text-xs uppercase tracking-wider">Moyenne générale du semestre</div>
          <div className="mt-1 font-bold text-primary text-4xl">{moy.toFixed(2)} <span className="text-muted-foreground text-lg">/ 20</span></div>
        </div>
        <div className="text-right">
          <div className="text-muted-foreground text-xs uppercase tracking-wider">Décision</div>
          <div className={`mt-1 inline-flex items-center rounded-lg px-4 py-2 text-lg font-bold ${admis ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {decision ?? label}
          </div>
        </div>
      </div>
    </div>
  );
}