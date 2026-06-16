// Typed wrappers around the UniPlus REST API.
// Endpoint shapes follow the published OpenAPI spec.

import { api } from "./client";

// ---------- Auth ----------
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api<{ success: boolean; accessToken: string; refreshToken?: string; user: any }>(`/auth/login`, { method: "POST", body: data }),
  register: (data: { email: string; password: string; nom?: string; prenom?: string }) =>
    api(`/auth/register`, { method: "POST", body: data }),
  refresh: (refreshToken: string) =>
    api<{ success: boolean; accessToken: string }>(`/auth/refresh`, { method: "POST", body: { refreshToken } }),
  profile: () => api<any>(`/auth/profile`),
};

// ---------- Etudiants ----------
export const etudiantsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; statut?: string }) =>
    api<any>(`/etudiants`, { query: params }),
  get: (id: string | number) => api<any>(`/etudiants/${id}`),
  create: (data: any) => api<any>(`/etudiants`, { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/etudiants/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/etudiants/${id}`, { method: "DELETE" }),
};

// ---------- Departements ----------
export const departementsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api<any>(`/departements`, { query: params }),
  get: (id: string | number) => api<any>(`/departements/${id}`),
  create: (data: any) => api<any>(`/departements`, { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/departements/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/departements/${id}`, { method: "DELETE" }),
};

// ---------- Filieres ----------
export const filieresApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api<any>(`/filieres`, { query: params }),
  get: (id: string | number) => api<any>(`/filieres/${id}`),
  create: (data: any) => api<any>(`/filieres`, { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/filieres/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/filieres/${id}`, { method: "DELETE" }),
};

// ---------- Annees scolaires ----------
export const anneesApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api<any>(`/annees-scolaires`, { query: params }),
  active: () => api<any>(`/annees-scolaires/active`),
  get: (id: string | number) => api<any>(`/annees-scolaires/${id}`),
  create: (data: any) => api<any>(`/annees-scolaires`, { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/annees-scolaires/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/annees-scolaires/${id}`, { method: "DELETE" }),
  /** Calendar semesters for an academic year (10 rows). */
  listSemestres: (anneeScolaireId: string | number) =>
    api<any>(`/annees-scolaires/${anneeScolaireId}/semestres`),
  updateCalendarSemestre: (
    anneeScolaireId: string | number,
    calendarSemestreId: string | number,
    data: { dateDebut?: string; dateFin?: string; actif?: boolean },
  ) =>
    api<any>(`/annees-scolaires/${anneeScolaireId}/semestres/${calendarSemestreId}`, {
      method: "PUT",
      body: data,
    }),
};

// ---------- Niveaux annee ----------
export const niveauxAnneeApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    anneeScolaireId?: number;
    filiereId?: number;
  }) => api<any>(`/niveaux-annee`, { query: params }),
  get: (id: string | number) => api<any>(`/niveaux-annee/${id}`),
};

// ---------- Semestres (catalog, read-only) ----------
export const semestresApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api<any>(`/semestres`, { query: params }),
  get: (id: string | number) => api<any>(`/semestres/${id}`),
};

// ---------- Groupes ----------
export const groupesApi = {
  list: (params?: { page?: number; limit?: number; niveauAnneeId?: number }) =>
    api<any>(`/groupes`, { query: params }),
  get: (id: string | number) => api<any>(`/groupes/${id}`),
  create: (data: {
    filiereId: number;
    anneeScolaireId: number;
    niveauAnneeId: number;
    nom: string;
    capaciteMax?: number;
  }) => api<any>(`/groupes`, { method: "POST", body: data }),
  update: (id: string | number, data: { nom?: string; capaciteMax?: number }) =>
    api<any>(`/groupes/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/groupes/${id}`, { method: "DELETE" }),
};

// ---------- Enseignants ----------
export const enseignantsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api<any>(`/enseignants`, { query: params }),
  get: (id: string | number) => api<any>(`/enseignants/${id}`),
  create: (data: any) => api<any>(`/enseignants`, { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/enseignants/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/enseignants/${id}`, { method: "DELETE" }),
};

// ---------- Unites d'enseignement ----------
export const ueApi = {
  list: (params?: { page?: number; limit?: number; search?: string; niveauCode?: string }) =>
    api<any>(`/unites-enseignement`, { query: params }),
  get: (id: string | number) => api<any>(`/unites-enseignement/${id}`),
  create: (data: {
    filiereId: number;
    niveauCode: string;
    code: string;
    intitule: string;
    creditsEcts: number;
    typeUe: string;
  }) => api<any>(`/unites-enseignement`, { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/unites-enseignement/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/unites-enseignement/${id}`, { method: "DELETE" }),
};

// ---------- Matieres ----------
export const matieresApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api<any>(`/matieres`, { query: params }),
  get: (id: string | number) => api<any>(`/matieres/${id}`),
  create: (data: {
    ueId: number;
    anneeScolaireSemestreId: number;
    code: string;
    intitule: string;
    coefficient: number;
    volumeHoraire: number;
    description?: string;
  }) => api<any>(`/matieres`, { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/matieres/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/matieres/${id}`, { method: "DELETE" }),
};

// ---------- Inscriptions ----------
export const inscriptionsApi = {
  list: (params?: { page?: number; limit?: number }) => api<any>(`/inscriptions`, { query: params }),
  get: (id: string | number) => api<any>(`/inscriptions/${id}`),
  byGroup: (groupeId: string | number) => api<any>(`/inscriptions/group/${groupeId}`),
  create: (data: {
    etudiantId: number;
    groupeId: number;
    niveauAnneeId: number;
    anneeScolaireId: number;
    estRedoublant?: boolean;
    numeroBordereau?: string;
    montantPaye?: string | number;
  }) => api<any>(`/inscriptions`, { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/inscriptions/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/inscriptions/${id}`, { method: "DELETE" }),
  semesterResult: (inscriptionId: string | number, anneeScolaireSemestreId: string | number) =>
    api<any>(`/inscriptions/${inscriptionId}/result/semester/${anneeScolaireSemestreId}`, { method: "POST" }),
  annualResult: (inscriptionId: string | number, anneeId: string | number) =>
    api<any>(`/inscriptions/${inscriptionId}/result/annual/${anneeId}`, { method: "POST" }),
};

// ---------- Notes ----------
export const notesApi = {
  create: (data: {
    inscriptionId: number;
    matiereId: number;
    anneeScolaireSemestreId: number;
    noteNormale?: number | null;
    noteRattrapage?: number | null;
    absenceInjustifiee?: boolean;
  }) => api<any>(`/notes`, { method: "POST", body: data }),
  forSemester: (inscriptionId: string | number, anneeScolaireSemestreId: string | number) =>
    api<any>(`/notes/inscription/${inscriptionId}/semester/${anneeScolaireSemestreId}`),
  update: (id: string | number, data: any) => api<any>(`/notes/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/notes/${id}`, { method: "DELETE" }),
  bulkUpsert: (data: {
    notes: Array<{
      inscriptionId: number;
      matiereId: number;
      anneeScolaireSemestreId: number;
      noteNormale?: number | null;
      noteRattrapage?: number | null;
      absenceInjustifiee?: boolean;
    }>;
  }) => api<any>(`/notes/bulk-upsert`, { method: "POST", body: data }),
};


// ---------- Presences ----------
export const presencesApi = {
  list: (params?: { anneeScolaireSemestreId?: number; page?: number; limit?: number }) =>
    api<any>(`/feuilles-presence`, { query: params }),
  createSheet: (data: {
    affectationCoursId: number;
    semestreId: number;
    dateSeance: string;
    titreSeance?: string;
  }) => api<any>(`/feuilles-presence`, { method: "POST", body: data }),
  bulk: (data: any) => api<any>(`/feuilles-presence/bulk-presence`, { method: "POST", body: data }),
  forSheet: (feuilleId: string | number) => api<any>(`/feuilles-presence/${feuilleId}/presences`),
};

// ---------- Stages ----------
export const stagesApi = {
  list: () => api<any>(`/stages`),
  get: (id: string | number) => api<any>(`/stages/${id}`),
  create: (data: any) => api<any>(`/stages`, { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/stages/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/stages/${id}`, { method: "DELETE" }),
};

// ---------- Reports ----------
export const reportsApi = {
  bulletinSemestre: (inscriptionId: string | number, anneeScolaireSemestreId: string | number) =>
    api<any>(`/reports/bulletin-semestre/${inscriptionId}/${anneeScolaireSemestreId}`),
  bulletinAnnuel: (inscriptionId: string | number, anneeScolaireId: string | number) =>
    api<any>(`/reports/bulletin-annuel/${inscriptionId}/${anneeScolaireId}`),
  /** @deprecated use bulletinSemestre */
  bulletin: (inscriptionId: string | number, anneeScolaireSemestreId: string | number) =>
    api<any>(`/reports/bulletin-semestre/${inscriptionId}/${anneeScolaireSemestreId}`),
};

export const affectationsApi = {
  list: (params?: { page?: number; limit?: number; anneeScolaireSemestreId?: number }) =>
    api<any>(`/affectations-cours`, { query: params }),
  get: (id: string | number) => api<any>(`/affectations-cours/${id}`),
  create: (data: {
    matiereId: number;
    enseignantId: number;
    groupeId: number;
    anneeScolaireSemestreId: number;
  }) => api<any>(`/affectations-cours`, { method: "POST", body: data }),
  remove: (id: string | number) => api<void>(`/affectations-cours/${id}`, { method: "DELETE" }),
};
