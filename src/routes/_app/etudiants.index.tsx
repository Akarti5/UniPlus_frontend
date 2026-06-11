import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2, Filter } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/stat-card";
import { FilterBar, SearchInput, SelectInput } from "@/components/ui/filter-bar";
import { DataTable, THead, TH, TR, TD, Avatar, ActionButton } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge-status";
import { ApiStatusBanner } from "@/components/ApiStatusBanner";
import { useApiList } from "@/lib/api/use-api-list";
import { etudiantsApi } from "@/lib/api/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/etudiants/")({
  head: () => ({ meta: [{ title: "Étudiants — UniPlus" }] }),
  component: EtudiantsListPage,
});

function EtudiantsListPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, isFallback, refetch } = useApiList(
    ["etudiants", { q, status }],
    () => etudiantsApi.list({ search: q || undefined, statut: status || undefined }),
  );
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: (id: number | string) => etudiantsApi.remove(id),
    onSuccess: () => { toast.success("Étudiant supprimé"); qc.invalidateQueries({ queryKey: ["etudiants"] }); refetch(); },
    onError: (e: any) => toast.error(`Suppression impossible — ${e?.message ?? "API hors-ligne"}`),
  });

  const filtered = (data as any[]).filter((e: any) => {
    const matchQ = !q || `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(q.toLowerCase());
    const matchS = !status || e.statut === status;
    return matchQ && matchS;
  });

  return (
    <div>
      <PageHeader
        title="Étudiants"
        subtitle={`${filtered.length} étudiants enregistrés`}
        actions={
          <Link to="/etudiants/create">
            <Button><Plus className="w-4 h-4" /> Nouvel étudiant</Button>
          </Link>
        }
      />
      <ApiStatusBanner show={isFallback} />

      <FilterBar>
        <SearchInput placeholder="Matricule, nom, prénom..." value={q} onChange={setQ} />
        <SelectInput value={status} onChange={setStatus}>
          <option value="">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="archive">Archivés</option>
        </SelectInput>
        <Button variant="secondary" size="sm" onClick={() => { setQ(""); setStatus(""); }}>
          <Filter className="w-3.5 h-3.5" /> Réinitialiser
        </Button>
      </FilterBar>

      <DataTable>
        <THead>
          <TR>
            <TH>Étudiant</TH>
            <TH>Matricule</TH>
            <TH>Date naissance</TH>
            <TH>Sexe</TH>
            <TH>Statut</TH>
            <TH>Inscriptions</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <tbody>
          {filtered.map((e: any) => (
            <TR key={e.id}>
              <TD>
                <div className="flex items-center gap-3">
                  <Avatar name={`${e.nom} ${e.prenom}`} />
                  <div>
                    <div className="font-medium">{e.nom} {e.prenom}</div>
                    <div className="text-muted-foreground text-xs">{e.email}</div>
                  </div>
                </div>
              </TD>
              <TD>
                <Link to="/etudiants/$id" params={{ id: String(e.id) }} className="font-mono text-primary text-xs hover:underline">
                  {e.matricule}
                </Link>
              </TD>
              <TD className="text-muted-foreground">{e.dateNaissance}</TD>
              <TD>{e.sexe === "M" ? "Masculin" : "Féminin"}</TD>
              <TD><StatusBadge status={e.statut} /></TD>
              <TD><span className="bg-muted px-2 py-0.5 rounded-md font-medium text-xs">{e.nbInscriptions}</span></TD>
              <TD>
                <div className="flex justify-end gap-1">
                  <Link to="/etudiants/$id" params={{ id: String(e.id) }}><ActionButton title="Voir"><Eye className="w-4 h-4" /></ActionButton></Link>
                  <ActionButton title="Modifier"><Pencil className="w-4 h-4" /></ActionButton>
                  <ActionButton variant="danger" title="Supprimer" onClick={() => { if (confirm(`Supprimer ${e.nom} ${e.prenom} ?`)) del.mutate(e.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </ActionButton>
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </DataTable>

      <div className="flex justify-between items-center mt-4 text-muted-foreground text-sm">
        <div>Affichage 1-{filtered.length} sur {(data as any[]).length} étudiants</div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Précédent</Button>
          <Button variant="secondary" size="sm">Suivant</Button>
        </div>
      </div>
    </div>
  );
}
