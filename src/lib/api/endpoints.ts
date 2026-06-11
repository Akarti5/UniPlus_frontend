// Typed wrappers around the UniPlus REST API.
// Endpoint shapes follow the published OpenAPI spec.

import { api } from "./client";

// ---------- Auth ----------
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api<{ accessToken: string; refreshToken?: string; user: any }>("/auth/login", { method: "POST", body: data }),
  register: (data: { email: string; password: string; nom?: string; prenom?: string }) =>
    api("/auth/register", { method: "POST", body: data }),
  refresh: (refreshToken: string) =>
    api<{ accessToken: string }>("/auth/refresh", { method: "POST", body: { refreshToken } }),
  profile: () => api<any>("/auth/profile"),
};

// ---------- Etudiants ----------
export const etudiantsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; statut?: string }) =>
    api<any>("/etudiants", { query: params }),
  get: (id: string | number) => api<any>(`/etudiants/${id}`),
  create: (data: any) => api<any>("/etudiants", { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/etudiants/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/etudiants/${id}`, { method: "DELETE" }),
};

// ---------- Departements ----------
export const departementsApi = {
  list: () => api<any>("/departements"),
  get: (id: string | number) => api<any>(`/departements/${id}`),
  create: (data: any) => api<any>("/departements", { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/departements/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/departements/${id}`, { method: "DELETE" }),
};

// ---------- Filieres ----------
export const filieresApi = {
  list: () => api<any>("/filieres"),
  get: (id: string | number) => api<any>(`/filieres/${id}`),
  create: (data: any) => api<any>("/filieres", { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/filieres/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/filieres/${id}`, { method: "DELETE" }),
};

// ---------- Annees scolaires ----------
export const anneesApi = {
  active: () => api<any>("/annees-scolaires/active"),
  create: (data: any) => api<any>("/annees-scolaires", { method: "POST", body: data }),
};

// ---------- Semestres ----------
export const semestresApi = {
  list: () => api<any>("/semestres"),
  get: (id: string | number) => api<any>(`/semestres/${id}`),
  create: (data: any) => api<any>("/semestres", { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/semestres/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/semestres/${id}`, { method: "DELETE" }),
};

// ---------- Groupes ----------
export const groupesApi = {
  list: () => api<any>("/groupes"),
  get: (id: string | number) => api<any>(`/groupes/${id}`),
  create: (data: any) => api<any>("/groupes", { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/groupes/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/groupes/${id}`, { method: "DELETE" }),
};

// ---------- Enseignants ----------
export const enseignantsApi = {
  create: (data: any) => api<any>("/enseignants", { method: "POST", body: data }),
};

// ---------- Unites d'enseignement ----------
export const ueApi = {
  list: () => api<any>("/unites-enseignement"),
  get: (id: string | number) => api<any>(`/unites-enseignement/${id}`),
  create: (data: any) => api<any>("/unites-enseignement", { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/unites-enseignement/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/unites-enseignement/${id}`, { method: "DELETE" }),
};

// ---------- Matieres ----------
export const matieresApi = {
  list: () => api<any>("/matieres"),
  get: (id: string | number) => api<any>(`/matieres/${id}`),
  create: (data: any) => api<any>("/matieres", { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/matieres/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/matieres/${id}`, { method: "DELETE" }),
};

// ---------- Affectations ----------
export const affectationsApi = {
  create: (data: any) => api<any>("/affectations-cours", { method: "POST", body: data }),
};

// ---------- Inscriptions ----------
export const inscriptionsApi = {
  list: (params?: { page?: number; limit?: number }) => api<any>("/inscriptions", { query: params }),
  get: (id: string | number) => api<any>(`/inscriptions/${id}`),
  byGroup: (groupeId: string | number) => api<any>(`/inscriptions/group/${groupeId}`),
  create: (data: any) => api<any>("/inscriptions", { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/inscriptions/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/inscriptions/${id}`, { method: "DELETE" }),
  semesterResult: (inscriptionId: string | number, semestreId: string | number) =>
    api<any>(`/inscriptions/${inscriptionId}/result/semester/${semestreId}`, { method: "POST" }),
  annualResult: (inscriptionId: string | number, anneeId: string | number) =>
    api<any>(`/inscriptions/${inscriptionId}/result/annual/${anneeId}`, { method: "POST" }),
};

// ---------- Notes ----------
export const notesApi = {
  create: (data: any) => api<any>("/notes", { method: "POST", body: data }),
  forSemester: (inscriptionId: string | number, semestreId: string | number) =>
    api<any>(`/notes/inscription/${inscriptionId}/semester/${semestreId}`),
  update: (id: string | number, data: any) => api<any>(`/notes/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/notes/${id}`, { method: "DELETE" }),
  bulkUpsert: (data: any) => api<any>("/notes/bulk-upsert", { method: "POST", body: data }),
};

// ---------- Presences ----------
export const presencesApi = {
  createSheet: (data: any) => api<any>("/feuilles-presence", { method: "POST", body: data }),
  bulk: (data: any) => api<any>("/feuilles-presence/bulk-presence", { method: "POST", body: data }),
  forSheet: (feuilleId: string | number) => api<any>(`/feuilles-presence/${feuilleId}/presences`),
};

// ---------- Stages ----------
export const stagesApi = {
  list: () => api<any>("/stages"),
  get: (id: string | number) => api<any>(`/stages/${id}`),
  create: (data: any) => api<any>("/stages", { method: "POST", body: data }),
  update: (id: string | number, data: any) => api<any>(`/stages/${id}`, { method: "PUT", body: data }),
  remove: (id: string | number) => api<void>(`/stages/${id}`, { method: "DELETE" }),
};

// ---------- Bulletin ----------
export const reportsApi = {
  bulletin: (inscriptionId: string | number, semestreId: string | number) =>
    api<any>(`/reports/bulletin-semestre/${inscriptionId}/${semestreId}`),
};
