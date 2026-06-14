import { createFileRoute } from "@tanstack/react-router";
import { Pencil, X, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/stat-card";
import { FilterBar, SelectInput } from "@/components/ui/filter-bar";
import { DataTable, THead, TH, TR, TD, ActionButton } from "@/components/ui/data-table";
import { ApiStatusBanner } from "@/components/ApiStatusBanner";
import { useApiList } from "@/lib/api/use-api-list";
import { semestresApi, anneesApi } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { AnneeScolaireSemestre, SemestreCatalog } from "@/lib/lmd";
import { toDateInputValue } from "@/lib/lmd";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 " +
  "bg-white dark:bg-gray-800 text-sm focus:outline-none " +
  "focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-shadow";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-medium text-gray-700 dark:text-gray-300 text-sm">{label}</label>
      {children}
    </div>
  );
}

interface CalendarEditModalProps {
  isOpen: boolean;
  row: AnneeScolaireSemestre | null;
  anneeScolaireId: number | string;
  onSave: (data: { dateDebut: string; dateFin: string; actif: boolean }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function CalendarEditModal({ isOpen, row, anneeScolaireId, onSave, onCancel, isSaving }: CalendarEditModalProps) {
  const [form, setForm] = useState({ dateDebut: "", dateFin: "", actif: false });

  useEffect(() => {
    if (isOpen && row) {
      setForm({
        dateDebut: toDateInputValue(row.dateDebut),
        dateFin: toDateInputValue(row.dateFin),
        actif: row.actif ?? false,
      });
    }
  }, [isOpen, row]);

  if (!isOpen || !row) return null;

  const label = row.semestre?.code ?? `S${row.semestre?.numero ?? "?"}`;

  return (
    <>
      <div className="z-40 fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="z-50 fixed inset-0 flex justify-center items-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-md pointer-events-auto">
          <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b">
            <div>
              <h2 className="font-bold text-lg">Modifier {label}</h2>
              <p className="mt-0.5 text-gray-400 text-xs">Dates et statut pour l'année scolaire #{anneeScolaireId}</p>
            </div>
            <button onClick={onCancel} aria-label="Fermer"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="gap-4 grid grid-cols-2">
              <Field label="Date début" htmlFor="cal-debut">
                <input id="cal-debut" type="date" value={form.dateDebut}
                  onChange={(e) => setForm((f) => ({ ...f, dateDebut: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Date fin" htmlFor="cal-fin">
                <input id="cal-fin" type="date" value={form.dateFin}
                  onChange={(e) => setForm((f) => ({ ...f, dateFin: e.target.value }))} className={inputCls} />
              </Field>
            </div>
            <Field label="Actif" htmlFor="cal-actif">
              <div className="flex items-center gap-2">
                <input id="cal-actif" type="checkbox" checked={form.actif}
                  onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))} className="w-5 h-5 accent-primary" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">Semestre actif pour cette année</span>
              </div>
            </Field>
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <button onClick={onCancel} className="flex-1 bg-red-50 hover:bg-red-100 px-4 py-2.5 border border-red-200 rounded-xl font-semibold text-red-600 text-sm">Annuler</button>
            <button onClick={() => onSave(form)} disabled={isSaving || !form.dateDebut || !form.dateFin}
              className="flex flex-1 justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 px-4 py-2.5 rounded-xl font-semibold text-white text-sm">
              {isSaving ? <span className="border-2 border-white/30 border-t-white rounded-full w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_app/semestres")({
  head: () => ({ meta: [{ title: "Semestres — UniPlus" }] }),
  component: SemestresPage,
});

function SemestresPage() {
  const { data: catalog, isFallback } = useApiList<SemestreCatalog>(
    ["semestres-catalog"],
    () => semestresApi.list({ limit: 20 }),
  );
  const { data: annees } = useApiList(
    ["annees-scolaires"],
    () => anneesApi.list({ limit: 1000 }),
  );

  const [selectedAnneeId, setSelectedAnneeId] = useState<string>("");
  const [editRow, setEditRow] = useState<AnneeScolaireSemestre | null>(null);

  useEffect(() => {
    if (!selectedAnneeId && annees.length > 0) {
      const active = (annees as any[]).find((a) => a.actif);
      setSelectedAnneeId(String(active?.id ?? annees[0].id));
    }
  }, [annees, selectedAnneeId]);

  const qc = useQueryClient();

  const { data: calendarRows = [], isLoading: calendarLoading } = useQuery({
    queryKey: ["annee-semestres", selectedAnneeId],
    queryFn: async () => {
      if (!selectedAnneeId) return [];
      const res = await anneesApi.listSemestres(selectedAnneeId) as any;
      return (res?.data ?? res ?? []) as AnneeScolaireSemestre[];
    },
    enabled: !!selectedAnneeId,
  });

  const editMutation = useMutation({
    mutationFn: ({ calendarId, ...payload }: { calendarId: number; dateDebut: string; dateFin: string; actif: boolean }) =>
      anneesApi.updateCalendarSemestre(selectedAnneeId, calendarId, payload),
    onSuccess: () => {
      toast.success("Semestre calendaire mis à jour");
      qc.invalidateQueries({ queryKey: ["annee-semestres", selectedAnneeId] });
      setEditRow(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erreur lors de la mise à jour"),
  });

  const catalogList = (catalog as SemestreCatalog[]).slice().sort((a, b) => a.numero - b.numero);

  return (
    <>
      <div className="space-y-8">
        <PageHeader
          title="Semestres"
          subtitle="Catalogue LMD (S1–S10) et calendrier par année scolaire"
        />

        <ApiStatusBanner show={isFallback} />

        <section>
          <h3 className="mb-3 font-semibold text-lg">Catalogue (référentiel fixe)</h3>
          <p className="mb-4 text-muted-foreground text-sm">
            Les semestres S1 à S10 sont prédéfinis. Utilisez leur ID lors de la création de matières.
          </p>
          <DataTable>
            <THead>
              <TR>
                <TH>ID</TH>
                <TH>Code</TH>
                <TH>Numéro</TH>
                <TH>Type</TH>
              </TR>
            </THead>
            <tbody>
              {catalogList.map((s) => (
                <TR key={s.id}>
                  <TD className="text-muted-foreground">{s.id}</TD>
                  <TD className="font-semibold">{s.code}</TD>
                  <TD>S{s.numero}</TD>
                  <TD>{s.type}</TD>
                </TR>
              ))}
            </tbody>
          </DataTable>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-lg">Calendrier par année scolaire</h3>
          <p className="mb-4 text-muted-foreground text-sm">
            Dates et statut actif pour chaque semestre. Utilisez l'ID calendaire (<code className="text-xs">anneeScolaireSemestreId</code>) pour les notes, affectations et présences.
          </p>

          <FilterBar>
            <SelectInput
              value={selectedAnneeId}
              onChange={setSelectedAnneeId}
              aria-label="Année scolaire"
            >
              {(annees as any[]).map((a) => (
                <option key={a.id} value={String(a.id)}>{a.label}{a.actif ? " (active)" : ""}</option>
              ))}
            </SelectInput>
          </FilterBar>

          <DataTable>
            <THead>
              <TR>
                <TH>ID calendaire</TH>
                <TH>Semestre</TH>
                <TH>Début</TH>
                <TH>Fin</TH>
                <TH>Actif</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <tbody>
              {calendarLoading ? (
                <TR><TD colSpan={6} className="py-8 text-muted-foreground text-center">Chargement…</TD></TR>
              ) : calendarRows.length === 0 ? (
                <TR><TD colSpan={6} className="py-8 text-muted-foreground text-center">Aucun semestre calendaire — créez d'abord une année scolaire</TD></TR>
              ) : (
                calendarRows
                  .slice()
                  .sort((a, b) => (a.semestre?.numero ?? 0) - (b.semestre?.numero ?? 0))
                  .map((row) => (
                    <TR key={row.id}>
                      <TD className="font-mono text-muted-foreground text-xs">{row.id}</TD>
                      <TD className="font-semibold">{row.semestre?.code ?? `S${row.semestre?.numero}`}</TD>
                      <TD className="text-muted-foreground">{toDateInputValue(row.dateDebut)}</TD>
                      <TD className="text-muted-foreground">{toDateInputValue(row.dateFin)}</TD>
                      <TD>{row.actif ? <span className="text-emerald-600">●</span> : "—"}</TD>
                      <TD className="text-right">
                        <ActionButton onClick={() => setEditRow(row)} title="Modifier les dates">
                          <Pencil className="w-4 h-4" />
                        </ActionButton>
                      </TD>
                    </TR>
                  ))
              )}
            </tbody>
          </DataTable>
        </section>
      </div>

      <CalendarEditModal
        isOpen={!!editRow}
        row={editRow}
        anneeScolaireId={selectedAnneeId}
        onSave={(data) => editRow && editMutation.mutate({ calendarId: editRow.id, ...data })}
        onCancel={() => setEditRow(null)}
        isSaving={editMutation.isPending}
      />
    </>
  );
}
