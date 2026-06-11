import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  GraduationCap,
  UserCog,
  ClipboardList,
  Hash,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { StatusBadge } from "@/components/ui/badge-status";
import { Avatar } from "@/components/ui/data-table";
import { inscriptions, studentsByFiliere, studentsByLevel } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Tableau de bord — UniPlus" }] }),
  component: Dashboard,
});

const PIE_COLORS = ["#2563EB", "#3B82F6", "#60A5FA", "#94A3B8", "#A5B4FC"];
const PIE_COLOR_CLASSES = ["bg-blue-600", "bg-blue-500", "bg-sky-500", "bg-slate-400", "bg-indigo-400"];

const pageClass = "min-h-screen space-y-5 bg-slate-50 p-6 text-slate-900 md:p-8";
const shellCardClass = "rounded-3xl border border-slate-200 bg-white shadow-[0_22px_55px_-20px_rgba(15,23,42,0.45)]";
const smallCardClass = "flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_38px_-18px_rgba(15,23,42,0.45)]";
const cardHeaderClass = "flex items-center justify-between border-b border-slate-200 p-5";
const sectionTitleClass = "text-[15px] font-semibold text-slate-900";
const sectionSubtitleClass = "text-[12px] text-slate-500";
const accentButtonClass =
  "inline-flex items-center gap-2 rounded-[10px] border border-blue-600/10 bg-blue-600 px-[18px] py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700";
const iconWrapClass = "flex shrink-0 items-center justify-center rounded-xl bg-blue-50 p-2.5 text-blue-600";
const selectClass =
  "cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 shadow-sm";

const pendingTasks = [
  { id: 1, label: "Valider 5 nouvelles inscriptions", done: true, date: "Nov 11" },
  { id: 2, label: "Vérifier notes L2 Informatique", done: true, date: "Nov 11" },
  { id: 3, label: "Réunion conseil pédagogique", done: false, date: "Nov 12" },
  { id: 4, label: "Saisir résultats du semestre 1", done: false, date: "Nov 13" },
  { id: 5, label: "Mettre à jour les emplois du temps", done: false, date: "Nov 14" },
];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string | number | null }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow-lg px-3 py-2 border border-slate-200 rounded-[10px] text-slate-900 text-xs">
      {label != null ? <p className="mb-1 text-slate-500">{label}</p> : null}
      <p className="font-semibold">{payload[0]?.name ?? "Valeur"}: {payload[0]?.value}</p>
    </div>
  );
}

// Composant de progression circulaire (Donut) utilisé sur le côté droit
function CircularProgress({ value }: { value: number }): React.ReactElement {
  const radius = 15.9;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-18 h-18">
      <svg viewBox="0 0 36 36" className="w-18 h-18 -rotate-90">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="drop-shadow-[0_0_5px_rgba(37,99,235,0.2)]"
        />
      </svg>
      <div className="absolute inset-0 flex justify-center items-center">
        <span className="font-bold text-slate-900 text-sm">{value}%</span>
      </div>
    </div>
  );
}

function Dashboard(): React.ReactElement {
  return (
    <div className={pageClass}>
      <div className="flex lg:flex-row flex-col lg:items-stretch gap-6">
        <div className={`${shellCardClass} flex-1 overflow-hidden`}>
          {/* Ajout de items-center pour aligner parfaitement le texte et la nouvelle photo large */}
          <div className="items-center gap-6 grid lg:grid-cols-[1fr_1.35fr] p-6 lg:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center bg-slate-50 px-3 py-1 border border-slate-200 rounded-full font-semibold text-[11px] text-slate-600">
                Année académique active · 2025-2026
              </div>

              <div className="space-y-2">
                <h1 className="font-bold text-slate-900 text-3xl md:text-4xl tracking-tight">Bonjour, Tsiaro 👋</h1>
                <p className="max-w-2xl text-slate-500 text-base">Voici ce qui se passe dans votre université aujourd&apos;hui.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div>
                  <p className="font-medium text-slate-600 text-sm">Campus central</p>
                  <p className="font-semibold text-slate-900 text-xl">Administration</p>
                </div>
                <div className="flex-1" />
                <button type="button" className={accentButtonClass}>
                  <Plus size={18} />
                  Ajouter un étudiant
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-600 text-sm">
                <span>Statut du campus</span>
                <span className="bg-emerald-500 rounded-full w-2.5 h-2.5" aria-hidden="true" />
                <span className="font-semibold text-emerald-600">En ligne</span>
              </div>
            </div>

            {/* Restauration: grande carte photo sombre en haut à droite, image couvrante */}
            <div className="relative bg-slate-900 shadow-[0_24px_55px_-28px_rgba(2,6,23,0.6)] border border-slate-800 rounded-3xl w-full aspect-16/10 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1470&auto=format&fit=crop"
                alt="University Campus"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:w-[320px]">
          <div className={smallCardClass}>
            <div className={iconWrapClass}>
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Total étudiants</p>
              <p className="font-bold text-[22px] text-slate-900">247</p>
              <p className="text-[11px] text-emerald-600">+12% ce mois</p>
            </div>
          </div>

          <div className={smallCardClass}>
            <div className={iconWrapClass}>
              <UserCog size={22} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Enseignants</p>
              <p className="font-bold text-[22px] text-slate-900">88</p>
              <p className="text-[11px] text-slate-500">Corps pédagogique</p>
            </div>
          </div>

          <div className={smallCardClass + " flex-1 justify-between items-center"}>
            <div>
              <p className="text-[11px] text-slate-500">Objectif inscriptions</p>
              <div className="flex gap-4 mt-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500">Cible</p>
                  <p className="font-bold text-[15px] text-slate-900">270</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Atteint</p>
                  <p className="font-bold text-[15px] text-emerald-600">240</p>
                </div>
              </div>
            </div>
            <CircularProgress value={89} />
          </div>
        </div>
      </div>

      <div className="gap-3 grid sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Étudiants actifs", value: "231", icon: Users },
          { label: "Inscriptions actives", value: "240", icon: ClipboardList, sub: "+8 cette semaine" },
          { label: "Notes saisies", value: "1 248", icon: Hash },
          { label: "En attente", value: "17", icon: Clock },
        ].map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className={smallCardClass}>
            <div className={iconWrapClass}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">{label}</p>
              <p className="font-bold text-[19px] text-slate-900">{value}</p>
              {sub ? <p className="text-[10px] text-emerald-600">{sub}</p> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="gap-4 grid xl:grid-cols-3">
        <div className={`${shellCardClass} overflow-hidden`}>
          <div className={cardHeaderClass}>
            <div>
              <p className={sectionTitleClass}>Inscriptions récentes</p>
              <p className={`${sectionSubtitleClass} mt-0.5`}>5 dernières inscriptions</p>
            </div>
            <button type="button" className="bg-transparent border-0 font-semibold text-[12px] text-blue-600">Voir tout</button>
          </div>

          <div>
            {inscriptions.slice(0, 5).map((inscription) => (
              <div key={inscription.id} className="flex items-center gap-3 px-5 py-3 border-slate-100 border-b last:border-b-0">
                <Avatar name={inscription.etudiant} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[13px] text-slate-900 truncate">{inscription.etudiant}</p>
                  <p className="text-[11px] text-slate-500">{inscription.groupe}</p>
                </div>
                <StatusBadge status={inscription.statut} />
              </div>
            ))}
          </div>
        </div>

        <div className={`${shellCardClass} p-5`}>
          <div className="flex justify-between items-center gap-4 mb-1">
            <div>
              <p className={sectionTitleClass}>Aperçu par filière</p>
              <p className={`${sectionSubtitleClass} mt-0.5`}>Répartition des étudiants</p>
            </div>
            <select aria-label="Année universitaire" className={selectClass}>
              <option>2025-2026</option>
            </select>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsByFiliere} barSize={18} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(37,99,235,0.06)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {studentsByFiliere.map((_, index) => (
                    <Cell key={index} fill={index % 3 === 0 ? "#2563EB" : index % 3 === 1 ? "#3B82F6" : "#60A5FA"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${shellCardClass} overflow-hidden`}>
          <div className={cardHeaderClass}>
            <div>
              <p className={sectionTitleClass}>Tâches administratives</p>
              <p className={`${sectionSubtitleClass} mt-0.5`}>2 sur 5 complétées</p>
            </div>
          </div>

          <div className="space-y-2.5 px-5 py-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2.5">
                {task.done ? (
                  <CheckCircle2 size={16} className="mt-px text-blue-600 shrink-0" />
                ) : (
                  <Circle size={16} className="mt-px text-slate-300 shrink-0" />
                )}
                <div className="flex flex-1 justify-between items-start gap-2">
                  <p className={`text-[12px] ${task.done ? "line-through text-slate-500" : "text-slate-700"}`}>{task.label}</p>
                  <span className="text-[10px] text-slate-400 shrink-0">{task.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 pt-3.5 pb-4 border-slate-100 border-t">
            <p className={`${sectionSubtitleClass} mb-1`}>Répartition par niveau (L1→M2)</p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={studentsByLevel} dataKey="value" nameKey="name" innerRadius={32} outerRadius={50} paddingAngle={3}>
                    {studentsByLevel.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {studentsByLevel.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <span className={`inline-block h-1.75 w-1.75 shrink-0 rounded-xs ${PIE_COLOR_CLASSES[index % PIE_COLOR_CLASSES.length]}`} />
                  <span className="text-[10px] text-slate-500">{entry.name}</span>
                  <span className="font-bold text-[10px] text-slate-900">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
