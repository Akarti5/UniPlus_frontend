import { createFileRoute } from "@tanstack/react-router";
import { Printer, FileDown, GraduationCap, Plus, Loader } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/stat-card";
import { FilterBar, SelectInput } from "@/components/ui/filter-bar";
import { ApiStatusBanner } from "@/components/ApiStatusBanner";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { inscriptionsApi, anneesApi, reportsApi } from "@/lib/api/endpoints";
import type { AnneeScolaireSemestre } from "@/lib/lmd";

export const Route = createFileRoute("/_app/reports/bulletin")({
  head: () => ({ meta: [{ title: "Bulletins — UniPlus" }] }),
  component: BulletinPage,
});

function BulletinPage() {
  const [selectedInscriptionId, setSelectedInscriptionId] = useState("");
  const [selectedCalendarSemestreId, setSelectedCalendarSemestreId] = useState("");
  const [bulletin, setBulletin] = useState<any>(null);

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
    if (!selectedCalendarSemestreId && calendarSemestres.length > 0) {
      const active = calendarSemestres.find((s) => s.actif) ?? calendarSemestres[0];
      setSelectedCalendarSemestreId(String(active.id));
    }
  }, [inscriptions, calendarSemestres, selectedInscriptionId, selectedCalendarSemestreId]);

  const handleGenerer = async () => {
    if (!selectedInscriptionId || !selectedCalendarSemestreId) {
      toast.error("Sélectionnez une inscription et un semestre calendaire");
      return;
    }
    try {
      const res = await reportsApi.bulletinSemestre(selectedInscriptionId, selectedCalendarSemestreId) as any;
      setBulletin(res?.data ?? res);
      toast.success("Bulletin chargé");
    } catch (e: any) {
      toast.error(e?.message ?? "Impossible de charger le bulletin");
    }
  };

  const handlePrint = () => window.print();
  const handleExportPDF = () => toast.success("Export PDF — à intégrer");

  const etu = bulletin?.etudiant;
  const semLabel = bulletin?.semestre?.code ?? bulletin?.semestre?.numero ? `S${bulletin.semestre.numero}` : "—";
  const moy = bulletin?.moyenneGenerale ?? 0;
  const admis = moy >= 10;

  return (
    <>
      <div>
        <PageHeader
          title="Bulletin de notes"
          subtitle="Génération d'un bulletin semestriel officiel"
          actions={
            <>
              <Button variant="secondary" onClick={handleExportPDF} disabled={!bulletin}>
                <FileDown className="w-4 h-4" /> Exporter PDF
              </Button>
              <Button onClick={handlePrint} disabled={!bulletin}>
                <Printer className="w-4 h-4" /> Imprimer
              </Button>
            </>
          }
        />

        <ApiStatusBanner show={isFallback} />

        <FilterBar>
          <SelectInput value={selectedInscriptionId} onChange={setSelectedInscriptionId} aria-label="Inscription">
            {(inscriptions as any[]).map((ins) => {
              const name = [ins.etudiant?.prenom, ins.etudiant?.nom].filter(Boolean).join(" ");
              const mat = ins.etudiant?.matricule ?? "";
              return (
                <option key={ins.id} value={ins.id}>{name || `#${ins.id}`} — {mat}</option>
              );
            })}
          </SelectInput>

          <SelectInput value={selectedCalendarSemestreId} onChange={setSelectedCalendarSemestreId} aria-label="Semestre calendaire">
            {calendarSemestres.map((s) => (
              <option key={s.id} value={s.id}>
                {s.semestre?.code ?? `S${s.semestre?.numero}`}
              </option>
            ))}
          </SelectInput>

          <Button size="sm" onClick={handleGenerer}>
            <Plus className="w-4 h-4" /> Générer
          </Button>
        </FilterBar>

        {!bulletin ? (
          <div className="flex justify-center items-center mt-12 text-muted-foreground">
            <Loader className="mr-2 w-5 h-5 opacity-50" />
            Sélectionnez une inscription et cliquez sur Générer
          </div>
        ) : (
          <div className="bg-card shadow-sm print:shadow-none mt-6 p-8 border border-border rounded-xl">
            <div className="flex justify-between items-center mb-6 pb-5 border-primary border-b-2">
              <div className="flex items-center gap-3">
                <div className="relative flex justify-center items-center bg-primary rounded-lg w-12 h-12 text-white">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-xl">UNIVERSITÉ — UniPlus</div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wider">Bulletin académique semestriel</div>
                </div>
              </div>
              <div className="text-muted-foreground text-xs text-right">
                <div>Année : {bulletin.anneeScolaire}</div>
                <div>Édité le {new Date().toLocaleDateString("fr-FR")}</div>
              </div>
            </div>

            <div className="gap-4 grid grid-cols-2 bg-muted/40 mb-6 p-4 rounded-lg text-sm">
              <div><span className="text-muted-foreground">Étudiant :</span> <strong>{etu?.prenom} {etu?.nom}</strong></div>
              <div><span className="text-muted-foreground">Matricule :</span> <strong className="font-mono">{etu?.matricule}</strong></div>
              <div><span className="text-muted-foreground">Filière :</span> <strong>{bulletin.filiere}</strong></div>
              <div><span className="text-muted-foreground">Groupe :</span> <strong>{bulletin.groupe}</strong></div>
              <div><span className="text-muted-foreground">Semestre :</span> <strong>{semLabel}</strong></div>
              <div><span className="text-muted-foreground">Niveau :</span> <strong>{bulletin.niveauCode}</strong></div>
            </div>

            <div className="space-y-5">
              {(bulletin.ueResults ?? []).map((ue: any) => (
                <div key={ue.ueCode ?? ue.ue} className="border border-border rounded-lg overflow-hidden">
                  <div className="flex justify-between items-center bg-primary/5 px-4 py-2.5">
                    <div className="font-semibold text-sm">
                      UE : {ue.ue} <span className="font-normal text-muted-foreground text-xs">({ue.typeUe} — {ue.credits} ECTS)</span>
                    </div>
                    <div className="font-bold text-primary text-sm">Moyenne UE : {ue.moyenne?.toFixed(2)}/20</div>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 border-border border-b">
                      <tr>
                        <th className="px-4 py-2 font-semibold text-muted-foreground text-xs text-left uppercase">Matière</th>
                        <th className="px-4 py-2 font-semibold text-muted-foreground text-xs text-center uppercase">Coef</th>
                        <th className="px-4 py-2 font-semibold text-muted-foreground text-xs text-center uppercase">Normale</th>
                        <th className="px-4 py-2 font-semibold text-muted-foreground text-xs text-center uppercase">Rattrapage</th>
                        <th className="px-4 py-2 font-semibold text-muted-foreground text-xs text-center uppercase">Finale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ue.matieres ?? []).map((m: any) => (
                        <tr key={m.code} className="border-border last:border-0 border-b">
                          <td className="px-4 py-2 font-medium">{m.matiere}</td>
                          <td className="px-4 py-2 text-center">{m.coefficient}</td>
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

            <div className="bg-primary/5 mt-8 p-5 border-2 border-primary rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wider">Moyenne générale du semestre</div>
                  <div className="mt-1 font-bold text-primary text-4xl">{moy.toFixed(2)} <span className="text-muted-foreground text-lg">/ 20</span></div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-xs uppercase tracking-wider">Décision</div>
                  <div className={`mt-1 inline-flex items-center rounded-lg px-4 py-2 text-lg font-bold ${admis ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {bulletin.decision ?? (admis ? "ADMIS" : "AJOURNÉ")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
