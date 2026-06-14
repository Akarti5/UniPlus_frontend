/** LMD niveau ↔ catalog semestre mapping (S1–S10). */

export const NIVEAU_CODES = ["L1", "L2", "L3", "M1", "M2"] as const;
export type NiveauCode = (typeof NIVEAU_CODES)[number];

/** Catalog semester numbers valid for each year level. */
export const NIVEAU_SEMESTRE_NUMEROS: Record<NiveauCode, number[]> = {
  L1: [1, 2],
  L2: [3, 4],
  L3: [5, 6],
  M1: [7, 8],
  M2: [9, 10],
};

export function semestresForNiveau(niveauCode: string): number[] {
  return NIVEAU_SEMESTRE_NUMEROS[niveauCode as NiveauCode] ?? [];
}

export function isSemestreValidForNiveau(niveauCode: string, semestreNumero: number): boolean {
  return semestresForNiveau(niveauCode).includes(semestreNumero);
}

export interface SemestreCatalog {
  id: number;
  numero: number;
  code: string;
  type: "impair" | "pair";
}

export interface AnneeScolaireSemestre {
  id: number;
  anneeScolaireId: number;
  semestreId: number;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
  semestre?: SemestreCatalog;
}

export interface NiveauAnnee {
  id: number;
  anneeScolaireId: number;
  filiereId: number;
  code: NiveauCode | string;
  filiere?: { id: number; nom: string; code: string; typeDiplome?: string };
  anneeScolaire?: { id: number; label: string };
}

export function resolveCalendarSemestreId(
  calendarSemestres: AnneeScolaireSemestre[],
  catalogSemestreId: number,
): number | undefined {
  const row = calendarSemestres.find(
    (c) => c.semestreId === catalogSemestreId || c.semestre?.id === catalogSemestreId,
  );
  return row?.id;
}

/** Normalize ISO date string to YYYY-MM-DD for date inputs. */
export function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}
