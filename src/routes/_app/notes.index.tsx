import { createFileRoute, Link } from "@tanstack/react-router";
import { PencilLine, Ban } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/stat-card";
import { FilterBar, SelectInput } from "@/components/ui/filter-bar";
import { DataTable, THead, TH, TR, TD } from "@/components/ui/data-table";
import { notes, groupes } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/notes/")({
  head: () => ({ meta: [{ title: "Notes — UniPlus" }] }),
  component: () => (
    <div>
      <PageHeader
        title="Notes"
        subtitle={`${notes.length} notes enregistrées`}
        actions={<Link to="/notes/saisie"><Button><PencilLine className="w-4 h-4" /> Saisie de notes</Button></Link>}
      />
      <FilterBar>
        <SelectInput><option>Toutes les inscriptions</option></SelectInput>
        <SelectInput>{[1,2,3,4,5,6].map((s) => <option key={s}>S{s}</option>)}</SelectInput>
        <SelectInput>{groupes.map((g) => <option key={g.id}>{g.nom}</option>)}</SelectInput>
      </FilterBar>
      <DataTable>
        <THead><TR><TH>#</TH><TH>Étudiant</TH><TH>Matière</TH><TH>UE</TH><TH>Semestre</TH><TH>Normale</TH><TH>Rattrapage</TH><TH>Finale</TH><TH>Abs. inj.</TH></TR></THead>
        <tbody>
          {notes.slice(0, 20).map((n) => {
            const finale = n.absenceInjustifiee ? 0 : (n.noteRattrapage ?? n.noteNormale ?? 0);
            return (
              <TR key={n.id}>
                <TD className="text-muted-foreground">{n.id}</TD>
                <TD className="font-medium">{n.etudiant}</TD>
                <TD>{n.matiere}</TD>
                <TD className="text-muted-foreground">{n.ue}</TD>
                <TD>{n.semestre}</TD>
                <TD>{n.noteNormale?.toFixed(2) ?? "—"}</TD>
                <TD>{n.noteRattrapage?.toFixed(2) ?? "—"}</TD>
                <TD className={finale < 10 ? "font-bold text-danger" : "font-bold text-emerald-600"}>{finale.toFixed(2)}</TD>
                <TD>{n.absenceInjustifiee && <Ban className="w-4 h-4 text-danger" />}</TD>
              </TR>
            );
          })}
        </tbody>
      </DataTable>
    </div>
  ),
});
