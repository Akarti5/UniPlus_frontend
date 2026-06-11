CreateNoteDTO{
inscriptionId*	[...]
matiereId*	[...]
semestreId*	[...]
noteNormale	[...]
noteRattrapage	[...]
absenceInjustifiee	[...]
}
UpdateNoteDTO{
noteNormale	[...]
noteRattrapage	[...]
absenceInjustifiee	[...]
}
CreateEtudiantDTO{
matricule*	[...]
nom*	[...]
prenom*	[...]
dateNaissance*	[...]
lieuNaissance	[...]
sexe*	[...]
email	[...]
telephone	[...]
adresse	[...]
}
UpdateEtudiantDTO{
nom	[...]
prenom	[...]
email	[...]
telephone	[...]
adresse	[...]
}
CreateInscriptionDTO{
etudiantId*	[...]
groupeId*	[...]
anneeScolaireId*	[...]
estRedoublant	[...]
numeroBordereau	[...]
montantPaye	[...]
}
CreateDepartementDTO{
nom*	[...]
code*	[...]
description	[...]
chefDepartement	[...]
}
CreateFiliereDTO{
departementId*	[...]
nom*	[...]
code*	[...]
typeDiplome*	[...]
dureeAnnees*	[...]
}
CreateAnneeScolaireDTO{
label*	[...]
dateDebut*	[...]
dateFin*	[...]
actif	[...]
}
CreateSemestreDTO{
anneeScolaireId*	[...]
numero*	[...]
type*	[...]
dateDebut*	[...]
dateFin*	[...]
actif	[...]
}
CreateGroupeDTO{
filiereId*	[...]
anneeScolaireId*	[...]
nom*	[...]
niveauAnnee*	[...]
capaciteMax	[...]
}
CreateEnseignantDTO{
departementId*	[...]
nom*	[...]
prenom*	[...]
email	[...]
grade	[...]
specialite	[...]
telephone	[...]
}
CreateUniteEnseignementDTO{
filiereId*	[...]
semestreNumero*	[...]
code*	[...]
intitule*	[...]
creditsEcts	[...]
typeUe	[...]
}
CreateMatiereDTO{
ueId*	[...]
code*	[...]
intitule*	[...]
coefficient	[...]
volumeHoraire	[...]
description	[...]
}
CreateAffectationCoursDTO{
matiereId*	[...]
enseignantId*	[...]
groupeId*	[...]
semestreId*	[...]
anneeScolaireId*	[...]
}
CreateFeuillePresenceDTO{
affectationCoursId*	[...]
semestreId*	[...]
dateSeance*	[...]
titreSeance	[...]
}
BulkPresenceDTO{
feuilleId*	[...]
presences*	[...]
}
CreateStageDTO{
inscriptionId*	[...]
anneeScolaireId*	[...]
enseignantId	[...]
entreprise	[...]
sujet	[...]
noteEncadrant	[...]
noteSoutenance	[...]
dateSoutenance	[...]
}
Error{
success	[...]
error	[...]
}
PaginatedResponse{
success	[...]
data	{...}
}