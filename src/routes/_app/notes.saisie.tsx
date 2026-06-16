import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/stat-card";
import { FilterBar, SelectInput } from "@/components/ui/filter-bar";
import { DataTable, THead, TH, TR, TD } from "@/components/ui/data-table";
import { notesApi, inscriptionsApi, matieresApi, anneesApi, groupesApi } from "@/lib/api/endpoints";
import type { AnneeScolaireSemestre } from "@/lib/lmd";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/notes/saisie")({
  head: () => ({ meta: [{ title: "Saisie de notes — UniPlus" }] }),
  component: NotesSaisiePage,
});

function NotesSaisiePage() {
  type Row = {
    inscriptionId: number;
    matricule: string;
    nom: string;
    normale: string;
    rattrapage: string;
    absent: boolean;
  };

  const [selectedGroupeId, setSelectedGroupeId] = useState("");
  const [selectedMatiereId, setSelectedMatiereId] = useState("");
  const [selectedCalendarSemestreId, setSelectedCalendarSemestreId] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  const { data: groupes = [] } = useQuery({
    queryKey: ["groupes"],
    queryFn: async () => {
      const res = await groupesApi.list({ limit: 500 }) as any;
      return res?.data?.data ?? res?.data ?? [];
    },
  });

  const { data: matieres = [] } = useQuery({
    queryKey: ["matieres"],
    queryFn: async () => {
      const res = await matieresApi.list({ limit: 500 }) as any;
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
    if (!selectedCalendarSemestreId && calendarSemestres.length > 0) {
      const active = calendarSemestres.find((s) => s.actif) ?? calendarSemestres[0];
      setSelectedCalendarSemestreId(String(active.id));
    }
  }, [calendarSemestres, selectedCalendarSemestreId]);

  useEffect(() => {
    if (!selectedGroupeId) {
      setRows([]);
      return;
    }
    inscriptionsApi.byGroup(selectedGroupeId).then((res: any) => {
      const list = res?.data?.data ?? res?.data ?? res ?? [];
      setRows(
        (Array.isArray(list) ? list : []).map((ins: any) => ({
          inscriptionId: ins.id,
          matricule: ins.etudiant?.matricule ?? ins.matricule ?? "",
          nom: [ins.etudiant?.prenom, ins.etudiant?.nom].filter(Boolean).join(" ") || "—",
          normale: "",
          rattrapage: "",
          absent: false,
        })),
      );
    }).catch(() => setRows([]));
  }, [selectedGroupeId]);

  const compute = (r: Row) => (r.absent ? 0 : parseFloat(r.rattrapage) || parseFloat(r.normale) || 0);

  const save = useMutation({
    mutationFn: () => {
      if (!selectedCalendarSemestreId || !selectedMatiereId) {
        throw new Error("Sélectionnez un semestre calendaire et une matière");
      }
      const notes = rows
        .filter((r) => r.normale || r.rattrapage || r.absent)
        .map((r) => ({
          inscriptionId: r.inscriptionId,
          matiereId: Number(selectedMatiereId),
          anneeScolaireSemestreId: Number(selectedCalendarSemestreId),
          noteNormale: r.normale ? parseFloat(r.normale) : null,
          noteRattrapage: r.rattrapage ? parseFloat(r.rattrapage) : null,
          absenceInjustifiee: r.absent,
        }));
      if (notes.length === 0) throw new Error("Aucune note à enregistrer");
      return notesApi.bulkUpsert({ notes });
    },
    onSuccess: () => toast.success("Notes enregistrées"),
    onError: (e: any) => toast.error(e?.message ?? "Enregistrement impossible"),
  });

  return (
    <div>
      <PageHeader
        title="Saisie de notes"
        subtitle="Saisie en masse pour un groupe et une matière"
        actions={
          <Button onClick={() => save.mutate()} disabled={save.isPending || !selectedGroupeId || !selectedMatiereId}>
            <Save className="w-4 h-4" /> {save.isPending ? "Enregistrement…" : "Enregistrer tout"}
          </Button>
        }
      />
      <FilterBar>
        <SelectInput aria-label="Groupe" value={selectedGroupeId} onChange={setSelectedGroupeId}>
          <option value="">Sélectionner un groupe</option>
          {(groupes as any[]).map((g) => <option key={g.id} value={g.id}>{g.nom}</option>)}
        </SelectInput>
        <SelectInput aria-label="Semestre calendaire" value={selectedCalendarSemestreId} onChange={setSelectedCalendarSemestreId}>
          <option value="">Semestre calendaire</option>
          {calendarSemestres.map((s) => (
            <option key={s.id} value={s.id}>
              {s.semestre?.code ?? `S${s.semestre?.numero}`} (ID {s.id})
            </option>
          ))}
        </SelectInput>
        <SelectInput aria-label="Matière" value={selectedMatiereId} onChange={setSelectedMatiereId}>
          <option value="">Sélectionner une matière</option>
          {(matieres as any[]).map((m) => <option key={m.id} value={m.id}>{m.intitule}</option>)}
        </SelectInput>
      </FilterBar>

      <DataTable>
        <THead><TR><TH>#</TH><TH>Matricule</TH><TH>Étudiant</TH><TH>Normale (0-20)</TH><TH>Rattrapage (0-20)</TH><TH>Absence injustifiée</TH><TH>Note finale</TH></TR></THead>
        <tbody>
          {rows.length === 0 ? (
            <TR><TD colSpan={7} className="py-8 text-muted-foreground text-center">Sélectionnez un groupe pour charger les inscriptions</TD></TR>
          ) : rows.map((r, i) => {
            const finale = compute(r);
            const fail = finale < 10 && (r.normale || r.rattrapage || r.absent);
            return (
              <TR key={r.inscriptionId} className={cn(fail && "bg-red-50/60")}>
                <TD className="text-muted-foreground">{i + 1}</TD>
                <TD className="font-mono text-xs">{r.matricule}</TD>
                <TD className="font-medium">{r.nom}</TD>
                <TD>
                  <input
                    aria-label={`Note normale de ${r.nom}`}
                    type="number" min={0} max={20} step={0.25} value={r.normale} disabled={r.absent}
                    onChange={(e) => setRows((p) => p.map((x, j) => j === i ? { ...x, normale: e.target.value } : x))}
                    className="bg-background disabled:bg-muted px-2 border border-border focus:border-primary rounded-md outline-none focus:ring-2 focus:ring-primary/15 w-24 h-9 text-sm"
                  />
                </TD>
                <TD>
                  <input
                    aria-label={`Note de rattrapage de ${r.nom}`}
                    type="number" min={0} max={20} step={0.25} value={r.rattrapage} disabled={r.absent}
                    onChange={(e) => setRows((p) => p.map((x, j) => j === i ? { ...x, rattrapage: e.target.value } : x))}
                    className="bg-background disabled:bg-muted px-2 border border-border focus:border-primary rounded-md outline-none focus:ring-2 focus:ring-primary/15 w-24 h-9 text-sm"
                  />
                </TD>
                <TD>
                  <input
                    aria-label={`Absence injustifiée de ${r.nom}`}
                    type="checkbox" checked={r.absent}
                    onChange={(e) => setRows((p) => p.map((x, j) => j === i ? { ...x, absent: e.target.checked, normale: e.target.checked ? "" : x.normale, rattrapage: e.target.checked ? "" : x.rattrapage } : x))}
                    className="w-4 h-4 accent-danger"
                  />
                </TD>
                <TD className={cn("font-bold", finale < 10 ? "text-danger" : "text-emerald-600")}>{finale.toFixed(2)}</TD>
              </TR>
            );
          })}
        </tbody>
      </DataTable>
    </div>
  );
}
