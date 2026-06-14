# UniPlus API — Feature Branch Changes (Frontend Migration Guide)

**Branch**: `feature` (compared to `main` / current `API_REFERENCE.md`)  
**Base URL**: `http://HOST:PORT/api/v1`  
**Auth**: Bearer Token (JWT) — unchanged

This document lists **only what changed**. For unchanged endpoints, keep using [API_REFERENCE.md](./API_REFERENCE.md).

---

## Summary

The feature branch refactors how **semesters** and **year levels (niveaux)** work in the LMD model:

| Before (`main`) | After (`feature`) |
|-----------------|-------------------|
| Semesters were created per academic year (`POST /semestres`) | Semesters are a **fixed catalog** S1–S10 (`GET /semestres` only) |
| Calendar dates lived on `semestres` rows | Calendar dates live on **`annee_scolaire_semestres`** (per academic year) |
| Groups used string `niveauAnnee: "L1"` | Groups use FK `niveauAnneeId` (integer) |
| UEs tied to `semestreNumero` | UEs tied to `niveauCode` (L1–M2) |
| Grades, attendance, assignments used `semestreId` + often `anneeScolaireId` | These use **`anneeScolaireSemestreId`** (calendar semester row ID) |
| Inscriptions had no explicit level | Inscriptions require **`niveauAnneeId`** |
| Register body used `motDePasse` | Register body uses **`password`** |

---

## New Data Model (read this first)

### 1. Semestre catalog (global, read-only)

Fixed rows seeded in the database:

| `id` | `code` | `numero` | `type`   | Maps to niveau |
|------|--------|----------|----------|----------------|
| 1    | S1     | 1        | impair   | L1             |
| 2    | S2     | 2        | pair     | L1             |
| 3    | S3     | 3        | impair   | L2             |
| 4    | S4     | 4        | pair     | L2             |
| 5    | S5     | 5        | impair   | L3             |
| 6    | S6     | 6        | pair     | L3             |
| 7    | S7     | 7        | impair   | M1             |
| 8    | S8     | 8        | pair     | M1             |
| 9    | S9     | 9        | impair   | M2             |
| 10   | S10    | 10       | pair     | M2             |

**API**: `GET /semestres`, `GET /semestres/:id`

Use catalog `semestreId` when creating a **matière** (subject is linked to S1–S10, not to a calendar year).

### 2. AnneeScolaireSemestre (calendar semester)

When an academic year is created, the backend **auto-seeds 10 calendar rows** linking that year to each catalog semester, with default dates (year split in half: impair = first half, pair = second half).

**Shape**:

```json
{
  "id": 42,
  "anneeScolaireId": 1,
  "semestreId": 1,
  "dateDebut": "2024-09-01",
  "dateFin": "2025-01-15",
  "actif": true,
  "semestre": {
    "id": 1,
    "numero": 1,
    "code": "S1",
    "type": "impair"
  }
}
```

Use **`anneeScolaireSemestreId`** (= `id` above) everywhere a semester is tied to a **specific academic year**: notes, attendance, course assignments, semester results, semester bulletin.

**How to get it**: `GET /annees-scolaires/:anneeScolaireId/semestres`

### 3. NiveauAnnee (year level per filière + academic year)

When an academic year is created, the backend **auto-seeds** one row per `(filière, niveau)` — e.g. Licence filière gets L1, L2, L3; Master gets M1, M2.

**Shape**:

```json
{
  "id": 7,
  "anneeScolaireId": 1,
  "filiereId": 2,
  "code": "L1",
  "filiere": { "id": 2, "nom": "Informatique", "code": "INFO", "typeDiplome": "L" },
  "anneeScolaire": { "id": 1, "label": "2024-2025" }
}
```

**API**: `GET /niveaux-annee`, `GET /niveaux-annee/:id`

Use **`niveauAnneeId`** when creating groups and inscriptions.

---

## Frontend migration checklist

1. Replace all usages of **`semestreId`** (for year-scoped operations) with **`anneeScolaireSemestreId`** from `GET /annees-scolaires/:id/semestres`.
2. Stop calling **`POST /semestres`**, **`PUT /semestres/:id`**, **`DELETE /semestres/:id`** — removed.
3. Manage semester **dates** via **`GET/PUT /annees-scolaires/:id/semestres/:calendarSemestreId`** instead.
4. Replace group field **`niveauAnnee`** (string) with **`niveauAnneeId`** (integer from `/niveaux-annee`).
5. Add **`niveauAnneeId`** to inscription create payloads.
6. Replace UE field **`semestreNumero`** with **`niveauCode`** (`L1`–`M2`).
7. Add **`semestreId`** (catalog) when creating matières; validate it matches the UE's `niveauCode` (e.g. L1 → S1 or S2 only).
8. Remove **`anneeScolaireId`** from course assignment create — only **`anneeScolaireSemestreId`** is needed.
9. Update register form: **`motDePasse`** → **`password`**.
10. Refresh TypeScript types / API client for renamed path params and response fields (see tables below).

---

## New endpoints

### GET /niveaux-annee

List year levels (auto-seeded per academic year × filière).

**Auth**: Bearer Token

**Query parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `page` | integer | Default `1` |
| `limit` | integer | Default `20` |
| `anneeScolaireId` | integer | Filter by academic year |
| `filiereId` | integer | Filter by program |

**Response** `200 OK`:

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 7,
        "anneeScolaireId": 1,
        "filiereId": 2,
        "code": "L1",
        "createdAt": "2024-09-01T00:00:00.000Z",
        "filiere": { "id": 2, "nom": "Informatique", "code": "INFO", "typeDiplome": "L" },
        "anneeScolaire": { "id": 1, "label": "2024-2025" }
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 15, "pages": 1 }
  }
}
```

---

### GET /niveaux-annee/:id

Get one year level with related filière, academic year, and groups.

**Auth**: Bearer Token

**Response** `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 7,
    "anneeScolaireId": 1,
    "filiereId": 2,
    "code": "L1",
    "filiere": { "..." : "..." },
    "anneeScolaire": { "..." : "..." },
    "groupes": []
  }
}
```

---

### GET /annees-scolaires/:id/semestres

List calendar semesters for an academic year (10 rows, one per S1–S10).

**Auth**: Bearer Token

**Response** `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "anneeScolaireId": 1,
      "semestreId": 1,
      "dateDebut": "2024-09-01T00:00:00.000Z",
      "dateFin": "2025-01-15T00:00:00.000Z",
      "actif": true,
      "createdAt": "2024-09-01T00:00:00.000Z",
      "semestre": {
        "id": 1,
        "numero": 1,
        "code": "S1",
        "type": "impair"
      }
    }
  ]
}
```

**Frontend tip**: Store `data[n].id` as `anneeScolaireSemestreId` for the selected year + semester.

---

### PUT /annees-scolaires/:id/semestres/:calendarSemestreId

Update calendar dates / active flag for one semester in an academic year.

**Auth**: Bearer Token (Admin)

**Path parameters**:

| Param | Description |
|-------|-------------|
| `:id` | Academic year ID |
| `:calendarSemestreId` | **`anneeScolaireSemestre.id`** (NOT catalog `semestre.id`) |

**Request body** (all optional):

```json
{
  "dateDebut": "2024-09-01",
  "dateFin": "2025-01-15",
  "actif": true
}
```

Setting `"actif": true` deactivates all other calendar semesters for that academic year.

**Response** `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 42,
    "anneeScolaireId": 1,
    "semestreId": 1,
    "dateDebut": "2024-09-01T00:00:00.000Z",
    "dateFin": "2025-01-15T00:00:00.000Z",
    "actif": true,
    "semestre": { "id": 1, "numero": 1, "code": "S1", "type": "impair" }
  }
}
```

---

## Removed endpoints

| Method | Old path | Replacement |
|--------|----------|-------------|
| `POST` | `/semestres` | Auto-seeded on `POST /annees-scolaires` |
| `PUT` | `/semestres/:id` | `PUT /annees-scolaires/:id/semestres/:calendarSemestreId` |
| `DELETE` | `/semestres/:id` | Not applicable (catalog is fixed) |

---

## Changed endpoints

### Authentication

#### POST /auth/register

**Request body change**:

| Old field | New field |
|-----------|-----------|
| `motDePasse` | `password` |

```json
{
  "nom": "Admin",
  "prenom": "User",
  "email": "admin@university.edu",
  "password": "securePass123"
}
```

`POST /auth/login` is unchanged (`email`, `password`).

---

### Academic years

#### POST /annees-scolaires

**Side effect (new)**: Creating an academic year now also:

- Seeds **10** `annee_scolaire_semestres` rows (default dates from year range)
- Seeds **`niveaux_annee`** for every existing filière (L1–L3 or M1–M2)

No request body change. Response is still the created academic year object.

#### GET /annees-scolaires/:id

**Response now includes** nested relations when fetching by ID:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "label": "2024-2025",
    "dateDebut": "2024-09-01T00:00:00.000Z",
    "dateFin": "2025-06-30T00:00:00.000Z",
    "actif": true,
    "anneeScolaireSemestres": [ "..." ],
    "niveauxAnnee": [ "..." ],
    "groupes": [ "..." ]
  }
}
```

---

### Semesters (catalog)

#### GET /semestres

**Before**: Semesters per academic year with dates.  
**After**: Global catalog only (no `anneeScolaireId`, no dates).

```json
{
  "success": true,
  "data": [
    { "id": 1, "numero": 1, "code": "S1", "type": "impair" },
    { "id": 2, "numero": 2, "code": "S2", "type": "pair" }
  ]
}
```

#### GET /semestres/:id

Same shape — catalog row only, no calendar fields.

---

### Groups

#### POST /groupes

**Request body**:

| Old | New |
|-----|-----|
| `niveauAnnee: "L1"` (string enum) | `niveauAnneeId: 7` (integer, from `/niveaux-annee`) |

```json
{
  "filiereId": 2,
  "anneeScolaireId": 1,
  "niveauAnneeId": 7,
  "nom": "INFO L1 - Groupe A",
  "capaciteMax": 40
}
```

**Validation**: `niveauAnneeId` must belong to the same `filiereId` and `anneeScolaireId`.

#### PUT /groupes/:id

**Removed** from update body: `niveauAnnee`. Only `nom` and `capaciteMax` remain updatable.

#### GET /groupes, GET /groupes/:id

**Response change**: `niveauAnnee` string replaced by nested object:

```json
{
  "id": 1,
  "filiereId": 2,
  "anneeScolaireId": 1,
  "niveauAnneeId": 7,
  "nom": "INFO L1 - Groupe A",
  "capaciteMax": 40,
  "niveauAnnee": {
    "id": 7,
    "code": "L1",
    "anneeScolaireId": 1,
    "filiereId": 2
  }
}
```

**New list filter**: `?niveauAnneeId=7` (replaces filtering by string niveau).

---

### Teaching units (UE)

#### POST /unites-enseignement

**Request body**:

| Old | New |
|-----|-----|
| `semestreNumero: 1` | `niveauCode: "L1"` |

```json
{
  "filiereId": 2,
  "niveauCode": "L1",
  "code": "UE01",
  "intitule": "Programmation",
  "creditsEcts": 6,
  "typeUe": "fondamentale"
}
```

#### GET responses

Replace `semestreNumero` with `niveauCode` in all UE objects. Matières nested under UE now include `semestre: { id, code, numero, type }`.

**New list filter**: `?niveauCode=L1` (replaces semester number filter if used).

---

### Subjects (matières)

#### POST /matieres

**New required field**: `semestreId` — catalog semester ID from `GET /semestres` (not calendar ID).

```json
{
  "ueId": 1,
  "semestreId": 1,
  "code": "PROG01",
  "intitule": "Introduction to Programming",
  "coefficient": 2.5,
  "volumeHoraire": 42,
  "description": "..."
}
```

**Validation rule**: `semestreId` must match the UE's `niveauCode`:

- L1 → S1 (numero 1) or S2 (numero 2)
- L2 → S3, S4
- L3 → S5, S6
- M1 → S7, S8
- M2 → S9, S10

#### GET responses

Matière objects now include `semestreId` and nested `semestre`:

```json
{
  "id": 1,
  "ueId": 1,
  "semestreId": 1,
  "code": "PROG01",
  "intitule": "Introduction to Programming",
  "semestre": { "id": 1, "numero": 1, "code": "S1", "type": "impair" }
}
```

---

### Inscriptions

#### POST /inscriptions

**New required field**: `niveauAnneeId`

```json
{
  "etudiantId": 1,
  "groupeId": 3,
  "niveauAnneeId": 7,
  "anneeScolaireId": 1,
  "estRedoublant": false,
  "numeroBordereau": "BORDER2024001",
  "montantPaye": "45000"
}
```

**Tip**: Use the same `niveauAnneeId` as the group's `niveauAnneeId`.

#### GET responses

Inscriptions now include `niveauAnneeId` and nested `niveauAnnee: { id, code, ... }`.

#### POST /inscriptions/:inscriptionId/result/semester/:anneeScolaireSemestreId

**Path param renamed**:

| Old | New |
|-----|-----|
| `:semestreId` | `:anneeScolaireSemestreId` |

Use the calendar semester ID, not the catalog ID.

---

### Course assignments

#### POST /affectations-cours

**Request body**:

| Old | New |
|-----|-----|
| `semestreId` + `anneeScolaireId` | `anneeScolaireSemestreId` only |

```json
{
  "matiereId": 1,
  "enseignantId": 2,
  "groupeId": 3,
  "anneeScolaireSemestreId": 42
}
```

#### GET /affectations-cours

**New query filter**: `?anneeScolaireSemestreId=42` (replaces separate semester + year filters).

**Response**: `semestreId` and `anneeScolaireId` removed; includes nested `anneeScolaireSemestre`:

```json
{
  "id": 1,
  "matiereId": 1,
  "enseignantId": 2,
  "groupeId": 3,
  "anneeScolaireSemestreId": 42,
  "anneeScolaireSemestre": {
    "id": 42,
    "anneeScolaireId": 1,
    "semestreId": 1,
    "dateDebut": "...",
    "dateFin": "...",
    "actif": true,
    "semestre": { "id": 1, "code": "S1", "numero": 1, "type": "impair" },
    "anneeScolaire": { "id": 1, "label": "2024-2025" }
  }
}
```

---

### Grades (notes)

#### POST /notes, PUT /notes/:id

**Request / response field rename**:

| Old | New |
|-----|-----|
| `semestreId` | `anneeScolaireSemestreId` |

```json
{
  "inscriptionId": 1,
  "matiereId": 5,
  "anneeScolaireSemestreId": 42,
  "noteNormale": 15,
  "noteRattrapage": null,
  "absenceInjustifiee": false
}
```

#### POST /notes/bulk-upsert

Top-level field rename:

```json
{
  "anneeScolaireSemestreId": 42,
  "notes": [
    {
      "inscriptionId": 1,
      "matiereId": 5,
      "noteNormale": 15,
      "noteRattrapage": null,
      "absenceInjustifiee": false
    }
  ]
}
```

(`semestreId` removed from individual note items — semester is set once at the top level.)

#### GET /notes/inscription/:inscriptionId/semester/:anneeScolaireSemestreId

**Path param renamed**: `:semestreId` → `:anneeScolaireSemestreId`

**Response items** use `anneeScolaireSemestreId` instead of `semestreId`.

---

### Attendance (feuilles-presence)

#### POST /feuilles-presence

**Request body**:

| Old | New |
|-----|-----|
| `semestreId` | `anneeScolaireSemestreId` |

```json
{
  "affectationCoursId": 1,
  "anneeScolaireSemestreId": 42,
  "dateSeance": "2024-10-15",
  "titreSeance": "Cours 3 - Boucles"
}
```

#### GET /feuilles-presence

**New query filter**: `?anneeScolaireSemestreId=42`

---

### Reports

#### GET /reports/bulletin-semestre/:inscriptionId/:anneeScolaireSemestreId

**Path param renamed**: `:semestreId` → `:anneeScolaireSemestreId`

**Response shape changed** (simplified example):

```json
{
  "success": true,
  "data": {
    "etudiant": {
      "matricule": "STU2024001",
      "nom": "Dupont",
      "prenom": "Jean"
    },
    "filiere": "Informatique",
    "groupe": "INFO L1 - Groupe A",
    "niveauCode": "L1",
    "anneeScolaire": "2024-2025",
    "semestre": {
      "code": "S1",
      "numero": 1,
      "type": "impair"
    },
    "ueResults": [
      {
        "ue": "Programmation",
        "ueCode": "UE01",
        "niveauCode": "L1",
        "credits": 6,
        "typeUe": "fondamentale",
        "moyenne": 14.5,
        "matieres": [
          {
            "matiere": "Introduction to Programming",
            "code": "PROG01",
            "semestre": "S1",
            "coefficient": 2.5,
            "noteNormale": 15,
            "noteRattrapage": null,
            "noteFinale": 15,
            "absenceInjustifiee": false
          }
        ]
      }
    ],
    "moyenneGenerale": 14.2,
    "decision": "en_attente"
  }
}
```

**Removed from old response**: top-level `inscriptionId`, `semestreId`, `moyenneSemestre`, `statusSemestre`, flat `ues[]` with `decision: "valide"`.

---

#### GET /reports/bulletin-annuel/:inscriptionId/:anneeScolaireId

**Response shape changed**:

```json
{
  "success": true,
  "data": {
    "etudiant": { "matricule": "...", "nom": "...", "prenom": "..." },
    "filiere": "Informatique",
    "groupe": "INFO L1 - Groupe A",
    "niveauCode": "L1",
    "anneeScolaire": "2024-2025",
    "theoriqueAverage": 14.0,
    "practicalAverage": 13.5,
    "finalAverage": 13.75,
    "semesterResults": [
      {
        "semestre": "S1",
        "moyenneTheorique": 14.2,
        "decision": "admis",
        "statutTheorique": null
      },
      {
        "semestre": "S2",
        "moyenneTheorique": 13.8,
        "decision": "admis",
        "statutTheorique": null
      }
    ],
    "stage": {
      "sujet": "...",
      "noteEncadrant": 14,
      "noteSoutenance": 13,
      "entreprise": "..."
    },
    "decision": "admis",
    "juryNote": null,
    "dateCalcul": "2025-06-30T12:00:00.000Z"
  }
}
```

**Removed from old response**: `inscriptionId`, `anneeScolaireId`, `semesters[].semestreId/numero/type`, `moyenneTheorique`, `moyennePratique`, `moyenneFinale`, `statusAnnee`, `etapes[]`.

**Note**: Annual bulletin only includes semesters valid for the student's `niveauCode` (e.g. L1 → S1 + S2 only).

---

## Field rename reference

| Context | Old field / param | New field / param |
|---------|-------------------|-------------------|
| Auth register | `motDePasse` | `password` |
| Group create | `niveauAnnee` (string) | `niveauAnneeId` (int) |
| Group response | `niveauAnnee: "L1"` | `niveauAnneeId` + `niveauAnnee: { id, code }` |
| UE create/list | `semestreNumero` | `niveauCode` |
| Matière create | _(none)_ | `semestreId` (catalog) |
| Inscription create | _(none)_ | `niveauAnneeId` |
| Affectation create | `semestreId`, `anneeScolaireId` | `anneeScolaireSemestreId` |
| Note create/bulk | `semestreId` | `anneeScolaireSemestreId` |
| Feuille presence | `semestreId` | `anneeScolaireSemestreId` |
| Path: notes by semester | `:semestreId` | `:anneeScolaireSemestreId` |
| Path: semester result | `:semestreId` | `:anneeScolaireSemestreId` |
| Path: bulletin semestre | `:semestreId` | `:anneeScolaireSemestreId` |
| Note/affectation/feuille responses | `semestreId` | `anneeScolaireSemestreId` |

---

## Recommended frontend flows

### Flow A — Create a group for L1 in 2024-2025

```
1. GET /annees-scolaires/active          → anneeScolaireId
2. GET /niveaux-annee?anneeScolaireId=1&filiereId=2  → find row where code === "L1" → niveauAnneeId
3. POST /groupes { filiereId, anneeScolaireId, niveauAnneeId, nom, capaciteMax }
```

### Flow B — Enter grades for S1

```
1. GET /annees-scolaires/1/semestres     → find row where semestre.code === "S1" → anneeScolaireSemestreId
2. POST /notes { inscriptionId, matiereId, anneeScolaireSemestreId, noteNormale, ... }
   OR POST /notes/bulk-upsert { anneeScolaireSemestreId, notes: [...] }
```

### Flow C — Assign teacher to a course this semester

```
1. GET /annees-scolaires/:id/semestres    → anneeScolaireSemestreId for target semester
2. POST /affectations-cours { matiereId, enseignantId, groupeId, anneeScolaireSemestreId }
```

### Flow D — Show semester bulletin

```
GET /reports/bulletin-semestre/:inscriptionId/:anneeScolaireSemestreId
```

---

## Niveau ↔ Semestre mapping (for UI labels)

| Niveau | Semestres (catalog codes) |
|--------|---------------------------|
| L1     | S1, S2                    |
| L2     | S3, S4                    |
| L3     | S5, S6                    |
| M1     | S7, S8                    |
| M2     | S9, S10                   |

---

## Unchanged endpoints

The following areas have **no API contract changes** on this branch:

- Departments, filières, enseignants, étudiants (except indirect relation includes)
- Stages (internships)
- Auth login, refresh, profile
- Most CRUD delete/list patterns

Refer to [API_REFERENCE.md](./API_REFERENCE.md) for full details on unchanged routes.

---

*Generated from diff `main...feature` — branch commit: `56c14fd`*
