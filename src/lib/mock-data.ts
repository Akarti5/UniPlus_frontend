// Mock data for UniPlus frontend demo

export const departements = [
  { id: 1, code: "INFO", nom: "Informatique", chefDepartement: "Dr. Benali", description: "Département d'informatique", nbFilieres: 4, nbEnseignants: 28 },
  { id: 2, code: "MATH", nom: "Mathématiques", chefDepartement: "Pr. Hadj", description: "Département de mathématiques", nbFilieres: 3, nbEnseignants: 22 },
  { id: 3, code: "PHYS", nom: "Physique", chefDepartement: "Dr. Mansouri", description: "Département de physique", nbFilieres: 2, nbEnseignants: 18 },
  { id: 4, code: "BIO", nom: "Biologie", chefDepartement: "Pr. Cherif", description: "Département de biologie", nbFilieres: 3, nbEnseignants: 20 },
];

export const filieres = [
  { id: 1, code: "GL", nom: "Génie Logiciel", departementId: 1, departement: "Informatique", typeDiplome: "M" as const, dureeAnnees: 2, nbGroupes: 4 },
  { id: 2, code: "RSI", nom: "Réseaux et Systèmes", departementId: 1, departement: "Informatique", typeDiplome: "M" as const, dureeAnnees: 2, nbGroupes: 3 },
  { id: 3, code: "INF", nom: "Informatique Générale", departementId: 1, departement: "Informatique", typeDiplome: "L" as const, dureeAnnees: 3, nbGroupes: 6 },
  { id: 4, code: "MATH-L", nom: "Mathématiques", departementId: 2, departement: "Mathématiques", typeDiplome: "L" as const, dureeAnnees: 3, nbGroupes: 5 },
  { id: 5, code: "PHY-L", nom: "Physique Générale", departementId: 3, departement: "Physique", typeDiplome: "L" as const, dureeAnnees: 3, nbGroupes: 4 },
];

export const annees = [
  { id: 1, label: "2025-2026", dateDebut: "2025-09-15", dateFin: "2026-06-30", actif: true, nbSemestres: 2 },
  { id: 2, label: "2024-2025", dateDebut: "2024-09-15", dateFin: "2025-06-30", actif: false, nbSemestres: 2 },
  { id: 3, label: "2023-2024", dateDebut: "2023-09-15", dateFin: "2024-06-30", actif: false, nbSemestres: 2 },
];

export const semestres = [
  { id: 1, numero: 1, type: "impair" as const, anneeLabel: "2025-2026", dateDebut: "2025-09-15", dateFin: "2026-01-30", actif: true },
  { id: 2, numero: 2, type: "pair" as const, anneeLabel: "2025-2026", dateDebut: "2026-02-01", dateFin: "2026-06-30", actif: false },
  { id: 3, numero: 3, type: "impair" as const, anneeLabel: "2025-2026", dateDebut: "2025-09-15", dateFin: "2026-01-30", actif: true },
  { id: 4, numero: 5, type: "impair" as const, anneeLabel: "2025-2026", dateDebut: "2025-09-15", dateFin: "2026-01-30", actif: true },
];

export const groupes = [
  { id: 1, nom: "L1-INF-G1", filiere: "Informatique Générale", niveau: "L1", annee: "2025-2026", capaciteMax: 35, nbInscrits: 32 },
  { id: 2, nom: "L1-INF-G2", filiere: "Informatique Générale", niveau: "L1", annee: "2025-2026", capaciteMax: 35, nbInscrits: 30 },
  { id: 3, nom: "L2-INF-G1", filiere: "Informatique Générale", niveau: "L2", annee: "2025-2026", capaciteMax: 30, nbInscrits: 28 },
  { id: 4, nom: "L3-INF-G1", filiere: "Informatique Générale", niveau: "L3", annee: "2025-2026", capaciteMax: 30, nbInscrits: 25 },
  { id: 5, nom: "M1-GL-G1", filiere: "Génie Logiciel", niveau: "M1", annee: "2025-2026", capaciteMax: 25, nbInscrits: 24 },
  { id: 6, nom: "M2-GL-G1", filiere: "Génie Logiciel", niveau: "M2", annee: "2025-2026", capaciteMax: 25, nbInscrits: 23 },
];

const noms = ["Benali","Hadj","Cherif","Mansouri","Boukhalfa","Saadi","Belkacem","Djebbar","Hammadi","Kheloufi","Larbi","Meziane","Ouali","Rahmani","Sahraoui","Tlemcani","Yahiaoui","Zerrouki","Boudiaf","Chaabane"];
const prenoms = ["Amina","Yacine","Sara","Karim","Lina","Mohamed","Imane","Adel","Nadia","Rachid","Salma","Bilal","Hana","Omar","Yasmine","Khaled","Fatima","Ali","Sofia","Nabil"];

export const etudiants = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  matricule: `20231${String(2340 + i).padStart(4, "0")}`,
  nom: noms[i % noms.length],
  prenom: prenoms[i % prenoms.length],
  dateNaissance: `200${(i % 5) + 2}-0${(i % 9) + 1}-${10 + (i % 18)}`,
  lieuNaissance: ["Alger", "Oran", "Constantine", "Annaba", "Blida"][i % 5],
  sexe: (i % 3 === 0 ? "F" : "M") as "M" | "F",
  email: `${prenoms[i % prenoms.length].toLowerCase()}.${noms[i % noms.length].toLowerCase()}@univ.dz`,
  telephone: `+213 5${50 + i} ${100 + i} ${200 + i}`,
  adresse: "Cité universitaire, Alger",
  statut: (i % 9 === 0 ? "archive" : "actif") as "actif" | "archive",
  nbInscriptions: 1 + (i % 4),
}));

export const inscriptions = etudiants.slice(0, 18).map((e, i) => ({
  id: i + 1,
  etudiant: `${e.nom} ${e.prenom}`,
  matricule: e.matricule,
  groupe: groupes[i % groupes.length].nom,
  filiere: groupes[i % groupes.length].filiere,
  niveau: groupes[i % groupes.length].niveau,
  anneeScolaire: "2025-2026",
  dateInscription: `2025-09-${10 + (i % 20)}`,
  statut: (["actif","actif","actif","redoublant","actif","exclu","diplome","actif"][i % 8]) as "actif"|"redoublant"|"exclu"|"diplome",
  estRedoublant: i % 8 === 3,
  paye: i % 4 !== 3,
  montantPaye: 15000,
}));

export const enseignants = [
  { id: 1, nom: "Benali", prenom: "Amina", departement: "Informatique", grade: "Pr", specialite: "IA", email: "a.benali@univ.dz", actif: true },
  { id: 2, nom: "Hadj", prenom: "Yacine", departement: "Mathématiques", grade: "MCA", specialite: "Algèbre", email: "y.hadj@univ.dz", actif: true },
  { id: 3, nom: "Cherif", prenom: "Sara", departement: "Informatique", grade: "MCB", specialite: "Bases de données", email: "s.cherif@univ.dz", actif: true },
  { id: 4, nom: "Mansouri", prenom: "Karim", departement: "Physique", grade: "Pr", specialite: "Mécanique quantique", email: "k.mansouri@univ.dz", actif: true },
  { id: 5, nom: "Boukhalfa", prenom: "Lina", departement: "Informatique", grade: "MAA", specialite: "Génie Logiciel", email: "l.boukhalfa@univ.dz", actif: true },
  { id: 6, nom: "Saadi", prenom: "Mohamed", departement: "Informatique", grade: "MAB", specialite: "Réseaux", email: "m.saadi@univ.dz", actif: false },
  { id: 7, nom: "Belkacem", prenom: "Imane", departement: "Biologie", grade: "MCA", specialite: "Génétique", email: "i.belkacem@univ.dz", actif: true },
  { id: 8, nom: "Djebbar", prenom: "Adel", departement: "Mathématiques", grade: "MCB", specialite: "Analyse", email: "a.djebbar@univ.dz", actif: true },
];

export const ues = [
  { id: 1, code: "UEF1.1", intitule: "Fondamentaux Informatique", filiere: "Informatique Générale", semestre: 1, typeUe: "fondamentale", credits: 6, nbMatieres: 3 },
  { id: 2, code: "UEM1.1", intitule: "Mathématiques 1", filiere: "Informatique Générale", semestre: 1, typeUe: "fondamentale", credits: 5, nbMatieres: 2 },
  { id: 3, code: "UET1.1", intitule: "Langues et Communication", filiere: "Informatique Générale", semestre: 1, typeUe: "transversale", credits: 2, nbMatieres: 2 },
  { id: 4, code: "UEO1.1", intitule: "Initiation Web", filiere: "Informatique Générale", semestre: 1, typeUe: "optionnelle", credits: 3, nbMatieres: 1 },
  { id: 5, code: "UEF3.1", intitule: "Génie Logiciel Avancé", filiere: "Génie Logiciel", semestre: 3, typeUe: "fondamentale", credits: 6, nbMatieres: 3 },
];

export const matieres = [
  { id: 1, code: "ALGO", intitule: "Algorithmique", ue: "UEF1.1", coefficient: 3, volumeHoraire: 60 },
  { id: 2, code: "ARCHI", intitule: "Architecture des ordinateurs", ue: "UEF1.1", coefficient: 2, volumeHoraire: 45 },
  { id: 3, code: "PROG", intitule: "Programmation C", ue: "UEF1.1", coefficient: 3, volumeHoraire: 60 },
  { id: 4, code: "ANA1", intitule: "Analyse 1", ue: "UEM1.1", coefficient: 3, volumeHoraire: 45 },
  { id: 5, code: "ALG1", intitule: "Algèbre 1", ue: "UEM1.1", coefficient: 2, volumeHoraire: 45 },
  { id: 6, code: "ANG1", intitule: "Anglais Technique", ue: "UET1.1", coefficient: 1, volumeHoraire: 22 },
];

export const affectations = [
  { id: 1, enseignant: "Benali Amina", matiere: "Algorithmique", groupe: "L1-INF-G1", semestre: "S1", annee: "2025-2026" },
  { id: 2, enseignant: "Cherif Sara", matiere: "Programmation C", groupe: "L1-INF-G1", semestre: "S1", annee: "2025-2026" },
  { id: 3, enseignant: "Hadj Yacine", matiere: "Analyse 1", groupe: "L1-INF-G1", semestre: "S1", annee: "2025-2026" },
  { id: 4, enseignant: "Djebbar Adel", matiere: "Algèbre 1", groupe: "L1-INF-G1", semestre: "S1", annee: "2025-2026" },
  { id: 5, enseignant: "Boukhalfa Lina", matiere: "Algorithmique", groupe: "L1-INF-G2", semestre: "S1", annee: "2025-2026" },
];

export const notes = etudiants.slice(0, 12).flatMap((e) => [
  { id: e.id * 10 + 1, etudiant: `${e.nom} ${e.prenom}`, matricule: e.matricule, matiere: "Algorithmique", ue: "UEF1.1", semestre: "S1", noteNormale: 8 + (e.id % 12), noteRattrapage: e.id % 4 === 0 ? 12 : null, absenceInjustifiee: false },
  { id: e.id * 10 + 2, etudiant: `${e.nom} ${e.prenom}`, matricule: e.matricule, matiere: "Programmation C", ue: "UEF1.1", semestre: "S1", noteNormale: 10 + (e.id % 10), noteRattrapage: null, absenceInjustifiee: e.id % 11 === 0 },
]);

export const resultatsSemestre = etudiants.slice(0, 15).map((e, i) => ({
  id: i + 1,
  matricule: e.matricule,
  etudiant: `${e.nom} ${e.prenom}`,
  groupe: "L1-INF-G1",
  semestre: "S1",
  moyenne: 8 + (i % 11) + Math.random() * 2,
  decision: (["admis","admis","admis","redoublement","admis","jury","exclusion","admis","en_attente"][i % 9]) as "admis"|"redoublement"|"exclusion"|"jury"|"en_attente",
  deliberation: i % 6 === 0,
}));

export const resultatsAnnuel = etudiants.slice(0, 12).map((e, i) => ({
  id: i + 1,
  matricule: e.matricule,
  etudiant: `${e.nom} ${e.prenom}`,
  moyenneTheorique: 9 + (i % 10) + Math.random(),
  moyennePratique: 12 + (i % 6) + Math.random(),
  moyenneFinal: 10 + (i % 8) + Math.random(),
  decision: (["admis","admis","redoublement","admis","jury","exclusion","admis","en_attente"][i % 8]) as "admis"|"redoublement"|"exclusion"|"jury"|"en_attente",
}));

export const stages = etudiants.slice(0, 8).map((e, i) => ({
  id: i + 1,
  etudiant: `${e.nom} ${e.prenom}`,
  matricule: e.matricule,
  annee: "2025-2026",
  entreprise: ["Sonatrach","Algérie Télécom","Djezzy","Cevital","Condor","Sonelgaz"][i % 6],
  sujet: ["Application mobile bancaire","Plateforme e-learning","Système IoT","Refonte ERP","Dashboard analytique","API Gateway"][i % 6],
  enseignant: enseignants[i % enseignants.length].nom,
  noteEncadrant: 14 + (i % 5),
  noteSoutenance: 13 + (i % 6),
  moyPratique: 13.5 + (i % 4),
  dateSoutenance: `2026-06-${10 + i}`,
}));

export const studentsByFiliere = [
  { name: "Info Générale", value: 86 },
  { name: "Génie Logiciel", value: 47 },
  { name: "Réseaux", value: 38 },
  { name: "Mathématiques", value: 52 },
  { name: "Physique", value: 24 },
];

export const studentsByLevel = [
  { name: "L1", value: 78 },
  { name: "L2", value: 62 },
  { name: "L3", value: 54 },
  { name: "M1", value: 30 },
  { name: "M2", value: 23 },
];
