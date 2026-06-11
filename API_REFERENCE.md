# UniPlus University Management System - Complete API Reference

## Overview

This is a comprehensive API reference for the **UniPlus University Management System**, a complete backend solution for managing academic records in universities following the ** LMD system** (Licence-Master-Doctorat).

**Base URL**: `http://HOST:PORT`  
**API Version**: 1.0.0  
**Authentication**: Bearer Token (JWT)

---

## Table of Contents

1. [Shared DTOs](#shared-dtos)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Student Management](#student-management)
4. [Teacher Management](#teacher-management)
5. [Department Management](#department-management)
6. [Program Management](#program-management)
7. [Academic Year Management](#academic-year-management)
8. [Semester Management](#semester-management)
9. [Group Management](#group-management)
10. [Teaching Unit Management](#teaching-unit-management)
11. [Subject Management](#subject-management)
12. [Student Registration](#student-registration)
13. [Course Assignments](#course-assignments)
14. [Grade Management](#grade-management)
15. [Attendance Management](#attendance-management)
16. [Internship Management](#internship-management)
17. [Academic Reports](#academic-reports)

---

## Shared DTOs

### Authentication Response

```json
{
  "id": 1,
  "email": "admin@university.edu",
  "role": "admin",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Error Response

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Pagination Response (List Endpoints)

```json
{
  "success": true,
  "data": [
    {
      // Resource object
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Common Field Types

- **ID Fields**: Integer (auto-generated)
- **Dates**: ISO 8601 format (YYYY-MM-DD)
- **Grades/Notes**: 0-20 scale
- **Statuses**: Enum values as specified
- **Enums**:
  - Gender: `M`, `F`
  - Diploma Type: `L` (Licence), `M` (Master)
  - Year Level: `L1`, `L2`, `L3`, `M1`, `M2`
  - Semester Type: `impair` (odd), `pair` (even)
  - Teaching Unit Type: `fondamentale`, `optionnelle`, `transversale`
  - Attendance Status: `present`, `absent`, `retard`, `justifie`
  - Registration Status: `actif`, `redoublant`, `exclu`, `diplome`

---

## Authentication Endpoints

### POST /auth/register

**Description**: Register a new administrator user

**Auth required**: No

**Request Body**:

```json
{
  "nom": "string (max 100 chars)",
  "prenom": "string (max 100 chars)",
  "email": "string (valid email)",
  "motDePasse": "string (min 6 chars)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    // AuthResponseDTO
    "id": 1,
    "email": "admin@university.edu",
    "role": "admin",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data or validation failure
- `409 Conflict` - Email already registered

---

### POST /auth/login

**Description**: Authenticate user and obtain tokens

**Auth required**: No

**Request Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@university.edu",
    "role": "admin",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses**:
- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid credentials

---

### POST /auth/refresh

**Description**: Refresh access token using refresh token

**Auth required**: No

**Request Body**:

```json
{
  "refreshToken": "string"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@university.edu",
    "role": "admin",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses**:
- `400 Bad Request` - Missing or invalid refresh token
- `401 Unauthorized` - Token expired or invalid

---

### GET /auth/profile

**Description**: Get current authenticated user's profile

**Auth required**: Yes (Bearer Token)

**Parameters**: None

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@university.edu",
    "role": "admin"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

## Student Management

### POST /etudiants

**Description**: Create a new student record

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "matricule": "string (max 20 chars, required)",
  "nom": "string (max 100 chars, required)",
  "prenom": "string (max 100 chars, required)",
  "dateNaissance": "string (ISO date, required)",
  "lieuNaissance": "string (optional)",
  "sexe": "string - enum: M or F (required)",
  "email": "string (email format, optional)",
  "telephone": "string (optional)",
  "adresse": "string (optional)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "matricule": "STU2024001",
    "nom": "Dupont",
    "prenom": "Jean",
    "dateNaissance": "2003-05-15",
    "lieuNaissance": "Alger",
    "sexe": "M",
    "email": "jean.dupont@student.edu",
    "telephone": "+213600000001",
    "adresse": "123 Rue de la Paix, Alger",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `409 Conflict` - Student with same matricule already exists

---

### GET /etudiants

**Description**: List all students with pagination and search

**Auth required**: Yes (Bearer Token)

**Query Parameters**:
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 20) - Number of records per page
- `search` (optional) - Search by name, matricule, or email

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "matricule": "STU2024001",
      "nom": "Dupont",
      "prenom": "Jean",
      "dateNaissance": "2003-05-15",
      "lieuNaissance": "Alger",
      "sexe": "M",
      "email": "jean.dupont@student.edu",
      "telephone": "+213600000001",
      "adresse": "123 Rue de la Paix, Alger"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid pagination parameters
- `401 Unauthorized` - Missing or invalid token

---

### GET /etudiants/:id

**Description**: Get student details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Student ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "matricule": "STU2024001",
    "nom": "Dupont",
    "prenom": "Jean",
    "dateNaissance": "2003-05-15",
    "lieuNaissance": "Alger",
    "sexe": "M",
    "email": "jean.dupont@student.edu",
    "telephone": "+213600000001",
    "adresse": "123 Rue de la Paix, Alger",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Student with given ID not found

---

### PUT /etudiants/:id

**Description**: Update student information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Student ID

**Request Body** (all fields optional):

```json
{
  "nom": "string",
  "prenom": "string",
  "email": "string",
  "telephone": "string",
  "adresse": "string"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "matricule": "STU2024001",
    "nom": "Dupont",
    "prenom": "Jean",
    "dateNaissance": "2003-05-15",
    "lieuNaissance": "Alger",
    "sexe": "M",
    "email": "jean.dupont@student.edu",
    "telephone": "+213600000002",
    "adresse": "456 Rue Nouvelle, Alger",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Student not found

---

## Teacher Management

### POST /enseignants

**Description**: Create a new teacher record

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "departementId": "integer (required)",
  "nom": "string (max 100 chars, required)",
  "prenom": "string (max 100 chars, required)",
  "email": "string (email format, optional)",
  "grade": "string (optional)",
  "specialite": "string (optional)",
  "telephone": "string (optional)",
  "dateEmbauche": "string (ISO date, optional)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "departementId": 1,
    "nom": "Martin",
    "prenom": "Pierre",
    "email": "pierre.martin@university.edu",
    "grade": "Professeur",
    "specialite": "Informatique",
    "telephone": "+213600001111",
    "dateEmbauche": "2020-09-01",
    "actif": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Department not found

---

### GET /enseignants

**Description**: List all teachers with pagination and search

**Auth required**: Yes (Bearer Token)

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Records per page
- `search` (optional) - Search by name or email

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "departementId": 1,
      "nom": "Martin",
      "prenom": "Pierre",
      "email": "pierre.martin@university.edu",
      "grade": "Professeur",
      "specialite": "Informatique",
      "telephone": "+213600001111",
      "dateEmbauche": "2020-09-01",
      "actif": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid pagination parameters
- `401 Unauthorized` - Missing or invalid token

---

### GET /enseignants/:id

**Description**: Get teacher details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Teacher ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "departementId": 1,
    "nom": "Martin",
    "prenom": "Pierre",
    "email": "pierre.martin@university.edu",
    "grade": "Professeur",
    "specialite": "Informatique",
    "telephone": "+213600001111",
    "dateEmbauche": "2020-09-01",
    "actif": true
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Teacher not found

---

### PUT /enseignants/:id

**Description**: Update teacher information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Teacher ID

**Request Body** (all fields optional):

```json
{
  "nom": "string",
  "prenom": "string",
  "email": "string",
  "grade": "string",
  "specialite": "string",
  "telephone": "string",
  "actif": "boolean"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "departementId": 1,
    "nom": "Martin",
    "prenom": "Pierre",
    "email": "pierre.martin@university.edu",
    "grade": "Professeur Agrégé",
    "specialite": "Informatique",
    "telephone": "+213600001111",
    "dateEmbauche": "2020-09-01",
    "actif": true,
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Teacher not found

---

### DELETE /enseignants/:id

**Description**: Delete a teacher record

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Teacher ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "message": "Teacher deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Teacher not found

---

## Department Management

### POST /departements

**Description**: Create a new department

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "nom": "string (max 150 chars, required)",
  "code": "string (max 20 chars, required)",
  "description": "string (optional)",
  "chefDepartement": "string (optional)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Informatique",
    "code": "INFO",
    "description": "Department of Computer Science",
    "chefDepartement": "Dr. Ahmed Benali",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `409 Conflict` - Department code already exists

---

### GET /departements

**Description**: List all departments with pagination and search

**Auth required**: Yes (Bearer Token)

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Records per page
- `search` (optional) - Search by name or code

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "Informatique",
      "code": "INFO",
      "description": "Department of Computer Science",
      "chefDepartement": "Dr. Ahmed Benali"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid pagination parameters
- `401 Unauthorized` - Missing or invalid token

---

### GET /departements/:id

**Description**: Get department details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Department ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Informatique",
    "code": "INFO",
    "description": "Department of Computer Science",
    "chefDepartement": "Dr. Ahmed Benali"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Department not found

---

### PUT /departements/:id

**Description**: Update department information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Department ID

**Request Body** (all fields optional):

```json
{
  "nom": "string",
  "description": "string",
  "chefDepartement": "string"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Informatique et Réseaux",
    "code": "INFO",
    "description": "Department of Computer Science and Networks",
    "chefDepartement": "Dr. Fatima Benamar",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Department not found

---

### DELETE /departements/:id

**Description**: Delete a department record

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Department ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Department not found

---

## Program Management

### POST /filieres

**Description**: Create a new program/filiere

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "departementId": "integer (required)",
  "nom": "string (max 150 chars, required)",
  "code": "string (max 20 chars, required)",
  "typeDiplome": "enum - L or M (required)",
  "dureeAnnees": "integer 1-5 (required)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "departementId": 1,
    "nom": "Licence Informatique",
    "code": "LIC-INFO",
    "typeDiplome": "L",
    "dureeAnnees": 3,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Department not found
- `409 Conflict` - Program code already exists

---

### GET /filieres

**Description**: List all programs/filieres

**Auth required**: Yes (Bearer Token)

**Query Parameters**: None (optional pagination available)

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "departementId": 1,
      "nom": "Licence Informatique",
      "code": "LIC-INFO",
      "typeDiplome": "L",
      "dureeAnnees": 3
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

### GET /filieres/:id

**Description**: Get program/filiere details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Program ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "departementId": 1,
    "nom": "Licence Informatique",
    "code": "LIC-INFO",
    "typeDiplome": "L",
    "dureeAnnees": 3
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Program not found

---

### PUT /filieres/:id

**Description**: Update program/filiere information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Program ID

**Request Body** (all fields optional):

```json
{
  "nom": "string",
  "description": "string",
  "typeDiplome": "enum - L or M",
  "dureeAnnees": "integer 1-5"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "departementId": 1,
    "nom": "Licence Informatique",
    "code": "LIC-INFO",
    "typeDiplome": "L",
    "dureeAnnees": 3,
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Program not found

---

### DELETE /filieres/:id

**Description**: Delete a program/filiere record

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Program ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "message": "Program deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Program not found

---

## Academic Year Management

### POST /annees-scolaires

**Description**: Create a new academic year

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "label": "string (max 20 chars, required)",
  "dateDebut": "string (ISO date, required)",
  "dateFin": "string (ISO date, required)",
  "actif": "boolean (optional, default: false)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "label": "2024-2025",
    "dateDebut": "2024-09-01",
    "dateFin": "2025-06-30",
    "actif": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `409 Conflict` - Academic year already exists

---

### GET /annees-scolaires/active

**Description**: Get the currently active academic year

**Auth required**: Yes (Bearer Token)

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "label": "2024-2025",
    "dateDebut": "2024-09-01",
    "dateFin": "2025-06-30",
    "actif": true
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - No active academic year found

---

### GET /annees-scolaires

**Description**: List all academic years

**Auth required**: Yes (Bearer Token)

**Query Parameters**: None (optional pagination available)

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "label": "2024-2025",
      "dateDebut": "2024-09-01",
      "dateFin": "2025-06-30",
      "actif": true
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

### GET /annees-scolaires/:id

**Description**: Get academic year details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Academic year ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "label": "2024-2025",
    "dateDebut": "2024-09-01",
    "dateFin": "2025-06-30",
    "actif": true
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Academic year not found

---

### PUT /annees-scolaires/:id

**Description**: Update academic year information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Academic year ID

**Request Body** (all fields optional):

```json
{
  "label": "string",
  "dateDebut": "string (ISO date)",
  "dateFin": "string (ISO date)",
  "actif": "boolean"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "label": "2024-2025",
    "dateDebut": "2024-09-01",
    "dateFin": "2025-06-30",
    "actif": true,
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Academic year not found

---

## Semester Management

### POST /semestres

**Description**: Create a new semester

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "anneeScolaireId": "integer (required)",
  "numero": "integer 1-10 (required)",
  "type": "enum - impair or pair (required)",
  "dateDebut": "string (ISO date, required)",
  "dateFin": "string (ISO date, required)",
  "actif": "boolean (optional)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "anneeScolaireId": 1,
    "numero": 1,
    "type": "impair",
    "dateDebut": "2024-09-01",
    "dateFin": "2024-12-31",
    "actif": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Academic year not found

---

### GET /semestres

**Description**: List all semesters

**Auth required**: Yes (Bearer Token)

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "anneeScolaireId": 1,
      "numero": 1,
      "type": "impair",
      "dateDebut": "2024-09-01",
      "dateFin": "2024-12-31",
      "actif": true
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

### GET /semestres/:id

**Description**: Get semester details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Semester ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "anneeScolaireId": 1,
    "numero": 1,
    "type": "impair",
    "dateDebut": "2024-09-01",
    "dateFin": "2024-12-31",
    "actif": true
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Semester not found

---

### PUT /semestres/:id

**Description**: Update semester information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Semester ID

**Request Body** (all fields optional):

```json
{
  "dateDebut": "string (ISO date)",
  "dateFin": "string (ISO date)",
  "actif": "boolean"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "anneeScolaireId": 1,
    "numero": 1,
    "type": "impair",
    "dateDebut": "2024-09-01",
    "dateFin": "2024-12-31",
    "actif": true,
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Semester not found

---

### DELETE /semestres/:id

**Description**: Delete a semester record

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Semester ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "message": "Semester deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Semester not found

---

## Group Management

### POST /groupes

**Description**: Create a new student group/class

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "filiereId": "integer (required)",
  "anneeScolaireId": "integer (required)",
  "nom": "string (max 100 chars, required)",
  "niveauAnnee": "enum - L1, L2, L3, M1, M2 (required)",
  "capaciteMax": "integer (optional)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "filiereId": 1,
    "anneeScolaireId": 1,
    "nom": "Licence Informatique L1 - Groupe A",
    "niveauAnnee": "L1",
    "capaciteMax": 40,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Filiere or academic year not found

---

### GET /groupes

**Description**: List all student groups

**Auth required**: Yes (Bearer Token)

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filiereId": 1,
      "anneeScolaireId": 1,
      "nom": "Licence Informatique L1 - Groupe A",
      "niveauAnnee": "L1",
      "capaciteMax": 40
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

### GET /groupes/:id

**Description**: Get group details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Group ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "filiereId": 1,
    "anneeScolaireId": 1,
    "nom": "Licence Informatique L1 - Groupe A",
    "niveauAnnee": "L1",
    "capaciteMax": 40
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Group not found

---

### PUT /groupes/:id

**Description**: Update group information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Group ID

**Request Body** (all fields optional):

```json
{
  "nom": "string",
  "niveauAnnee": "enum - L1, L2, L3, M1, M2",
  "capaciteMax": "integer"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "filiereId": 1,
    "anneeScolaireId": 1,
    "nom": "Licence Informatique L1 - Groupe A",
    "niveauAnnee": "L1",
    "capaciteMax": 45,
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Group not found

---

### DELETE /groupes/:id

**Description**: Delete a group record

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Group ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "message": "Group deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Group not found

---

## Teaching Unit Management

### POST /unites-enseignement

**Description**: Create a new teaching unit (UE)

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "filiereId": "integer (required)",
  "semestreNumero": "integer 1-10 (required)",
  "code": "string (max 20 chars, required)",
  "intitule": "string (max 200 chars, required)",
  "creditsEcts": "integer (optional)",
  "typeUe": "enum - fondamentale, optionnelle, transversale (optional)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "filiereId": 1,
    "semestreNumero": 1,
    "code": "UE01",
    "intitule": "Fundaments of Programming",
    "creditsEcts": 6,
    "typeUe": "fondamentale",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Filiere not found

---

### GET /unites-enseignement

**Description**: List all teaching units

**Auth required**: Yes (Bearer Token)

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filiereId": 1,
      "semestreNumero": 1,
      "code": "UE01",
      "intitule": "Fundaments of Programming",
      "creditsEcts": 6,
      "typeUe": "fondamentale"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

### GET /unites-enseignement/:id

**Description**: Get teaching unit details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Teaching unit ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "filiereId": 1,
    "semestreNumero": 1,
    "code": "UE01",
    "intitule": "Fundaments of Programming",
    "creditsEcts": 6,
    "typeUe": "fondamentale"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Teaching unit not found

---

### PUT /unites-enseignement/:id

**Description**: Update teaching unit information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Teaching unit ID

**Request Body** (all fields optional):

```json
{
  "intitule": "string",
  "creditsEcts": "integer",
  "typeUe": "enum - fondamentale, optionnelle, transversale"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "filiereId": 1,
    "semestreNumero": 1,
    "code": "UE01",
    "intitule": "Fundaments of Programming and OOP",
    "creditsEcts": 6,
    "typeUe": "fondamentale",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Teaching unit not found

---

### DELETE /unites-enseignement/:id

**Description**: Delete a teaching unit record

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Teaching unit ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "message": "Teaching unit deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Teaching unit not found

---

## Subject Management

### POST /matieres

**Description**: Create a new subject (matière)

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "ueId": "integer (required)",
  "code": "string (max 20 chars, required)",
  "intitule": "string (max 200 chars, required)",
  "coefficient": "number (optional)",
  "volumeHoraire": "integer (optional)",
  "description": "string (optional)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "ueId": 1,
    "code": "PROG01",
    "intitule": "Introduction to Programming",
    "coefficient": 2.5,
    "volumeHoraire": 42,
    "description": "Basic programming concepts and Python",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Teaching unit not found

---

### GET /matieres

**Description**: List all subjects

**Auth required**: Yes (Bearer Token)

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ueId": 1,
      "code": "PROG01",
      "intitule": "Introduction to Programming",
      "coefficient": 2.5,
      "volumeHoraire": 42,
      "description": "Basic programming concepts and Python"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

### GET /matieres/:id

**Description**: Get subject details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Subject ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "ueId": 1,
    "code": "PROG01",
    "intitule": "Introduction to Programming",
    "coefficient": 2.5,
    "volumeHoraire": 42,
    "description": "Basic programming concepts and Python"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Subject not found

---

### PUT /matieres/:id

**Description**: Update subject information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Subject ID

**Request Body** (all fields optional):

```json
{
  "intitule": "string",
  "coefficient": "number",
  "volumeHoraire": "integer",
  "description": "string"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "ueId": 1,
    "code": "PROG01",
    "intitule": "Introduction to Programming",
    "coefficient": 3,
    "volumeHoraire": 48,
    "description": "Basic programming concepts using Python and JavaScript",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Subject not found

---

### DELETE /matieres/:id

**Description**: Delete a subject record

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Subject ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "message": "Subject deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Subject not found

---

## Student Registration

### POST /inscriptions

**Description**: Create a new student registration/inscription

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "etudiantId": "integer (required)",
  "groupeId": "integer (required)",
  "anneeScolaireId": "integer (required)",
  "estRedoublant": "boolean (optional)",
  "numeroBordereau": "string (optional)",
  "montantPaye": "number (optional)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "etudiantId": 1,
    "groupeId": 1,
    "anneeScolaireId": 1,
    "statut": "actif",
    "estRedoublant": false,
    "numeroBordereau": "BORDER2024001",
    "montantPaye": 45000,
    "datePaiement": "2024-09-01",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Student, group, or academic year not found
- `409 Conflict` - Student already registered in this group/year

---

### GET /inscriptions

**Description**: List all student registrations with pagination

**Auth required**: Yes (Bearer Token)

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Records per page

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "etudiantId": 1,
      "groupeId": 1,
      "anneeScolaireId": 1,
      "statut": "actif",
      "estRedoublant": false,
      "numeroBordereau": "BORDER2024001",
      "montantPaye": 45000,
      "datePaiement": "2024-09-01"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 300
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

### GET /inscriptions/:id

**Description**: Get registration details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Registration ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "etudiantId": 1,
    "groupeId": 1,
    "anneeScolaireId": 1,
    "statut": "actif",
    "estRedoublant": false,
    "numeroBordereau": "BORDER2024001",
    "montantPaye": 45000,
    "datePaiement": "2024-09-01"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Registration not found

---

### PUT /inscriptions/:id

**Description**: Update registration information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Registration ID

**Request Body** (all fields optional):

```json
{
  "statut": "enum - actif, redoublant, exclu, diplome",
  "estRedoublant": "boolean",
  "numeroBordereau": "string",
  "montantPaye": "number",
  "datePaiement": "string (ISO date)",
  "nomBanque": "string"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "etudiantId": 1,
    "groupeId": 1,
    "anneeScolaireId": 1,
    "statut": "actif",
    "estRedoublant": false,
    "numeroBordereau": "BORDER2024001",
    "montantPaye": 45000,
    "datePaiement": "2024-09-01",
    "nomBanque": "BNA",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Registration not found

---

## Course Assignments

### POST /affectations-cours

**Description**: Assign a teacher to a subject/group/semester

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "matiereId": "integer (required)",
  "enseignantId": "integer (required)",
  "groupeId": "integer (required)",
  "semestreId": "integer (required)",
  "anneeScolaireId": "integer (required)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "matiereId": 1,
    "enseignantId": 1,
    "groupeId": 1,
    "semestreId": 1,
    "anneeScolaireId": 1,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Subject, teacher, group, semester, or academic year not found
- `409 Conflict` - Assignment already exists

---

### GET /affectations-cours

**Description**: List all course assignments

**Auth required**: Yes (Bearer Token)

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "matiereId": 1,
      "enseignantId": 1,
      "groupeId": 1,
      "semestreId": 1,
      "anneeScolaireId": 1
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

### GET /affectations-cours/:id

**Description**: Get course assignment details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Assignment ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "matiereId": 1,
    "enseignantId": 1,
    "groupeId": 1,
    "semestreId": 1,
    "anneeScolaireId": 1
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Assignment not found

---

### DELETE /affectations-cours/:id

**Description**: Delete a course assignment

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Assignment ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "message": "Course assignment deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Assignment not found

---

## Grade Management

### POST /notes

**Description**: Create a new grade/note for a student

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "inscriptionId": "integer (required)",
  "matiereId": "integer (required)",
  "semestreId": "integer (required)",
  "noteNormale": "number 0-20 (optional)",
  "noteRattrapage": "number 0-20 (optional)",
  "absenceInjustifiee": "boolean (optional)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "inscriptionId": 1,
    "matiereId": 1,
    "semestreId": 1,
    "noteNormale": 15,
    "noteRattrapage": null,
    "absenceInjustifiee": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or grade out of range (0-20)
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Registration, subject, or semester not found
- `409 Conflict` - Grade already exists for this student/subject/semester

---

### GET /notes/inscription/:inscriptionId/semester/:semestreId

**Description**: Get all grades for a student in a specific semester

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `inscriptionId` (required) - Registration ID
- `semestreId` (required) - Semester ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "inscriptionId": 1,
      "matiereId": 1,
      "semestreId": 1,
      "noteNormale": 15,
      "noteRattrapage": null,
      "absenceInjustifiee": false
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Registration or semester not found

---

### PUT /notes/:id

**Description**: Update a grade/note

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Grade ID

**Request Body** (all fields optional):

```json
{
  "noteNormale": "number 0-20",
  "noteRattrapage": "number 0-20",
  "absenceInjustifiee": "boolean"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "inscriptionId": 1,
    "matiereId": 1,
    "semestreId": 1,
    "noteNormale": 16,
    "noteRattrapage": null,
    "absenceInjustifiee": false,
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or grade out of range
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Grade not found

---

### POST /notes/bulk-upsert

**Description**: Bulk import or update grades

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "notes": [
    {
      "inscriptionId": "integer",
      "matiereId": "integer",
      "semestreId": "integer",
      "noteNormale": "number 0-20 (optional)",
      "noteRattrapage": "number 0-20 (optional)",
      "absenceInjustifiee": "boolean (optional)"
    }
  ]
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "created": 10,
    "updated": 5,
    "errors": []
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input format
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user

---

## Attendance Management

### POST /feuilles-presence

**Description**: Create a new attendance sheet for a class session

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "affectationCoursId": "integer (required)",
  "semestreId": "integer (required)",
  "dateSeance": "string (ISO date, required)",
  "titreSeance": "string (optional)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "affectationCoursId": 1,
    "semestreId": 1,
    "dateSeance": "2024-09-15",
    "titreSeance": "Introduction to OOP Concepts",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Course assignment or semester not found

---

### GET /feuilles-presence

**Description**: List all attendance sheets

**Auth required**: Yes (Bearer Token)

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "affectationCoursId": 1,
      "semestreId": 1,
      "dateSeance": "2024-09-15",
      "titreSeance": "Introduction to OOP Concepts"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

### GET /feuilles-presence/:id

**Description**: Get attendance sheet details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Attendance sheet ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "affectationCoursId": 1,
    "semestreId": 1,
    "dateSeance": "2024-09-15",
    "titreSeance": "Introduction to OOP Concepts"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Attendance sheet not found

---

### GET /feuilles-presence/:feuilleId/presences

**Description**: Get attendance records for a specific sheet

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `feuilleId` (required) - Attendance sheet ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "feuilleId": 1,
      "inscriptionId": 1,
      "statut": "present",
      "justification": null
    },
    {
      "id": 2,
      "feuilleId": 1,
      "inscriptionId": 2,
      "statut": "absent",
      "justification": "Medical certificate"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Attendance sheet not found

---

### POST /feuilles-presence/bulk-presence

**Description**: Bulk update attendance records for multiple students

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "feuilleId": "integer (required)",
  "presences": [
    {
      "inscriptionId": "integer",
      "statut": "enum - present, absent, retard, justifie",
      "justification": "string (optional)"
    }
  ]
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "updated": 25,
    "errors": []
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input format or status value
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Attendance sheet not found

---

### PUT /feuilles-presence/:id

**Description**: Update attendance sheet information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Attendance sheet ID

**Request Body**:

```json
{
  "titreSeance": "string (optional)"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "affectationCoursId": 1,
    "semestreId": 1,
    "dateSeance": "2024-09-15",
    "titreSeance": "Updated Title",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Attendance sheet not found

---

### DELETE /feuilles-presence/:id

**Description**: Delete an attendance sheet

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Attendance sheet ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "message": "Attendance sheet deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Attendance sheet not found

---

## Internship Management

### POST /stages

**Description**: Create a new internship record

**Auth required**: Yes (Bearer Token - Admin only)

**Request Body**:

```json
{
  "inscriptionId": "integer (required)",
  "anneeScolaireId": "integer (required)",
  "enseignantId": "integer (optional)",
  "entreprise": "string (optional)",
  "sujet": "string (optional)",
  "noteEncadrant": "number 0-20 (optional)",
  "noteSoutenance": "number 0-20 (optional)",
  "dateSoutenance": "string (ISO date, optional)"
}
```

**Success Response** - `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "inscriptionId": 1,
    "anneeScolaireId": 1,
    "enseignantId": 1,
    "entreprise": "Tech Solutions Inc.",
    "sujet": "Mobile App Development with React Native",
    "noteEncadrant": 17,
    "noteSoutenance": 16,
    "dateSoutenance": "2025-06-15",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or grades out of range
- `401 Unauthorized` - Missing token or not authenticated
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Registration or academic year not found
- `409 Conflict` - Internship already exists for this student/year

---

### GET /stages

**Description**: List all internships

**Auth required**: Yes (Bearer Token)

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "inscriptionId": 1,
      "anneeScolaireId": 1,
      "enseignantId": 1,
      "entreprise": "Tech Solutions Inc.",
      "sujet": "Mobile App Development with React Native",
      "noteEncadrant": 17,
      "noteSoutenance": 16,
      "dateSoutenance": "2025-06-15"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

### GET /stages/:id

**Description**: Get internship details by ID

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `id` (required) - Internship ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "inscriptionId": 1,
    "anneeScolaireId": 1,
    "enseignantId": 1,
    "entreprise": "Tech Solutions Inc.",
    "sujet": "Mobile App Development with React Native",
    "noteEncadrant": 17,
    "noteSoutenance": 16,
    "dateSoutenance": "2025-06-15"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Internship not found

---

### PUT /stages/:id

**Description**: Update internship information

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Internship ID

**Request Body** (all fields optional):

```json
{
  "entreprise": "string",
  "sujet": "string",
  "noteEncadrant": "number 0-20",
  "noteSoutenance": "number 0-20",
  "dateSoutenance": "string (ISO date)"
}
```

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "inscriptionId": 1,
    "anneeScolaireId": 1,
    "enseignantId": 1,
    "entreprise": "Tech Solutions Inc.",
    "sujet": "Mobile App Development with React Native",
    "noteEncadrant": 18,
    "noteSoutenance": 17,
    "dateSoutenance": "2025-06-15",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or grades out of range
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Internship not found

---

### DELETE /stages/:id

**Description**: Delete an internship record

**Auth required**: Yes (Bearer Token - Admin only)

**Path Parameters**:
- `id` (required) - Internship ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "message": "Internship deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Internship not found

---

## Academic Reports

### GET /reports/bulletin-semestre/:inscriptionId/:semestreId

**Description**: Get semester academic transcript/bulletin for a student

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `inscriptionId` (required) - Registration ID
- `semestreId` (required) - Semester ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "inscriptionId": 1,
    "semestreId": 1,
    "etudiant": {
      "matricule": "STU2024001",
      "nom": "Dupont",
      "prenom": "Jean"
    },
    "ues": [
      {
        "id": 1,
        "code": "UE01",
        "intitule": "Fundamentals of Programming",
        "creditsEcts": 6,
        "matieres": [
          {
            "id": 1,
            "code": "PROG01",
            "intitule": "Programming I",
            "coefficient": 2.5,
            "noteNormale": 15,
            "noteRattrapage": null,
            "noteFinal": 15
          }
        ],
        "moyenneUe": 14.5,
        "decision": "valide"
      }
    ],
    "moyenneSemestre": 14.2,
    "statusSemestre": "valide"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Registration or semester not found

---

### GET /reports/bulletin-annuel/:inscriptionId/:anneeScolaireId

**Description**: Get annual academic transcript/bulletin for a student

**Auth required**: Yes (Bearer Token)

**Path Parameters**:
- `inscriptionId` (required) - Registration ID
- `anneeScolaireId` (required) - Academic year ID

**Success Response** - `200 OK`:

```json
{
  "success": true,
  "data": {
    "inscriptionId": 1,
    "anneeScolaireId": 1,
    "etudiant": {
      "matricule": "STU2024001",
      "nom": "Dupont",
      "prenom": "Jean"
    },
    "semesters": [
      {
        "semestreId": 1,
        "numero": 1,
        "type": "impair",
        "moyenneSemestre": 14.2,
        "status": "valide"
      },
      {
        "semestreId": 2,
        "numero": 2,
        "type": "pair",
        "moyenneSemestre": 13.8,
        "status": "valide"
      }
    ],
    "moyenneTheorique": 14.0,
    "moyennePratique": 13.5,
    "moyenneFinale": 13.75,
    "statusAnnee": "admis",
    "etapes": [
      {
        "numero": 1,
        "creditsObtenues": 30,
        "creditsTotales": 30,
        "decision": "admis"
      }
    ]
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Registration or academic year not found

---

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `204` | No Content - Request successful, no content to return |
| `400` | Bad Request - Invalid input or validation failure |
| `401` | Unauthorized - Missing or invalid authentication token |
| `403` | Forbidden - Authenticated but not authorized (insufficient permissions) |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Resource already exists or constraint violation |
| `500` | Internal Server Error - Server error |

---

## Authentication Notes

- All endpoints except `/auth/login`, `/auth/register`, and `/auth/refresh` require a valid Bearer token in the `Authorization` header
- Token format: `Authorization: Bearer <your_jwt_token>`
- Admin-only endpoints require the authenticated user to have the `admin` role
- Tokens should be refreshed before expiration using the `/auth/refresh` endpoint

---

## Validation Rules

### Common Validations

- **Email**: Must be a valid email format
- **Dates**: ISO 8601 format (YYYY-MM-DD)
- **Grades**: Must be between 0 and 20
- **Numeric Fields**: Must be positive integers or decimals as specified
- **String Fields**: Length limits enforced as specified in DTOs
- **Enum Fields**: Only predefined values accepted

### Error Handling

All errors follow the standard error response format with a `success: false` flag and an `error` message. Validation errors provide specific field-level feedback when available.

---

## Rate Limiting

- General API rate limit: Standard (adjustable per environment)
- Authentication endpoint rate limit: More restrictive to prevent brute force attacks
- Bulk operations may have specific rate limits

---

## Best Practices for Frontend Integration

1. **Always include Authorization header** with Bearer token for authenticated endpoints
2. **Handle 401 responses** by redirecting to login and requesting new tokens
3. **Validate input data** on the client side before sending requests
4. **Implement pagination** when listing resources to handle large datasets
5. **Use search parameters** to filter results and reduce payload sizes
6. **Cache immutable data** like department lists, programs, etc.
7. **Handle bulk operations** carefully and validate batch responses for partial failures
8. **Implement retry logic** for network-related failures
9. **Use appropriate HTTP methods**: GET for retrieval, POST for creation, PUT for updates
10. **Follow the standard response structure** for consistent error handling

---

**Generated**: January 15, 2024  
**Version**: 1.0.0  
**Maintained By**: Backend Development Team
