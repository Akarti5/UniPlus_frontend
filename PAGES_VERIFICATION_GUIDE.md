# Complete Pages Verification Guide

## Status Summary

### ✅ FIXED Pages (10 total)
1. departements.tsx - Removed nbFilieres, nbEnseignants
2. filieres.tsx - Removed code, departementId from PUT
3. enseignants.tsx - Removed departementId, actif
4. matieres.tsx - Removed code, ueId from PUT
5. groupes.tsx - Removed filiereId, anneeScolaireId from PUT; nbInscrits from POST
6. semestres.tsx - Removed anneeScolaireId, numero, type from PUT
7. etudiants.create.tsx - Removed statut from POST
8. inscriptions.tsx - Filtered relationship data
9. stages.tsx - Filtered computed/display fields
10. ue.tsx - Complete rewrite (field names, enums, type conversions)

### 📋 REMAINING Pages to Check

#### 1. affectations-cours.tsx
**API Spec:**
- POST: `matiereId`, `enseignantId`, `groupeId`, `semestreId`, `anneeScolaireId` (all required, integers)
- PUT: Endpoint appears read-only (no update documented)

**Check For:**
- [ ] Is `matiereId` sent as integer, not object?
- [ ] Are all required fields present?
- [ ] Is there a PUT mutation that shouldn't exist?

#### 2. feuilles-presence.tsx
**API Spec:**
- POST: `affectationCoursId`, `semestreId`, `dateSeance` (ISO string), `titreSeance` (optional)
- PUT: Only `titreSeance` can be updated
- Special: POST /feuilles-presence/bulk-presence for attendance records

**Check For:**
- [ ] Is `dateSeance` sent as ISO string (YYYY-MM-DD)?
- [ ] PUT mutation filters out immutable fields?
- [ ] Bulk presence payload has correct structure?

#### 3. notes.tsx / notes files
**API Spec:**
- POST /notes: `feuillePresenceId`, `inscriptionId`, `note` (0-20), `appreciation`
- PUT /notes/:id: Only `note` and `appreciation`
- POST /notes/bulk-upsert: Array of notes with upsert logic

**Check For:**
- [ ] Are note values validated (0-20 range)?
- [ ] Is `feuillePresenceId` sent as integer?
- [ ] PUT filters out immutable fields?

#### 4. affectations-classes.tsx (if exists)
Check against API for this endpoint

#### 5. Any other pages with mutations
Run: `grep -l "useMutation" /vercel/share/v0-project/src/routes/_app/*.tsx`

## Verification Checklist for Each Page

For every page with mutations, follow this checklist:

### Step 1: Get API Spec
```bash
grep -A 25 "### POST /your-endpoint\|### PUT /your-endpoint" /vercel/share/v0-project/API_REFERENCE.md
```

### Step 2: Review Form Data Type
```typescript
// Find the FormData type definition
type FormData = { ... }
```

### Step 3: Compare Fields
Create a table:
| Field | Form Name | API Name | Type | POST? | PUT? | Notes |
|-------|-----------|----------|------|-------|------|-------|
| | | | | ✓ | ✗ | Computed? Immutable? |

### Step 4: Check Mutations
```typescript
// POST mutation
const add = useMutation({
  mutationFn: (payload: FormData) => {
    // ❌ DON'T: Send computed fields (nbMatieres, nbFilieres, etc)
    // ✅ DO: Filter them if present
    const { computedField, ...data } = payload;
    return api.create(data);
  }
});

// PUT mutation
const edit = useMutation({
  mutationFn: ({ id, ...payload }: FormData & { id: Id }) => {
    // ❌ DON'T: Send immutable fields (code, id fields, numbers)
    // ✅ DO: Filter them
    const { code, id: ignored, ...data } = payload;
    return api.update(id, data);
  }
});
```

### Step 5: Check Enum Values
If form has select fields with enums:
- Get exact enum values from API_REFERENCE.md
- Ensure form uses lowercase/exact case match
- Example: `fondamentale` not `Fondamentale`

### Step 6: Check Type Conversions
- IDs should be numbers/integers in form state
- Dates should be ISO strings
- Selects should store IDs, not names
- Numbers should be actual numbers, not strings

## Common Issues and Fixes

### Issue 1: Sending Computed Fields
```typescript
// ❌ WRONG - nbMatieres is computed
const form = { ..., nbMatieres: 5 };

// ✅ CORRECT - Filter it out
const { nbMatieres, ...data } = form;
api.create(data);
```

### Issue 2: Field Name Mismatch
```typescript
// ❌ WRONG - Form uses different name
const form = { filiere: "Info" }; // Should be filiereId

// ✅ CORRECT - Match API exactly
const form = { filiereId: 1 };
```

### Issue 3: Wrong Enum Value
```typescript
// ❌ WRONG - "Fondamentale" (capitalized)
value="Fondamentale"

// ✅ CORRECT - "fondamentale" (lowercase)
value="fondamentale"
```

### Issue 4: ID as String
```typescript
// ❌ WRONG - ID as string
<option value={fil.nom}>{fil.nom}</option>

// ✅ CORRECT - ID as value
<option value={fil.id}>{fil.nom}</option>
```

### Issue 5: PUT Sending All Fields
```typescript
// ❌ WRONG - Sends everything including immutable
edit.mutate({ id, ...formData });

// ✅ CORRECT - Filter immutable fields
const { code, filiereId, ...updateData } = formData;
edit.mutate({ id, ...updateData });
```

## Testing Each Fix

For each page after fixing:

1. **Test Create (POST)**
   - All required fields filled
   - Validation errors disappear
   - Successfully creates record

2. **Test Edit (PUT)**
   - Can update allowed fields
   - Immutable fields are disabled/ignored
   - No validation errors

3. **Test Validations**
   - Range validations (1-10, 0-20)
   - Enum validations
   - Required field validations
   - Type validations (integer, string)

## Quick Commands

```bash
# List all pages with mutations
grep -l "useMutation" /vercel/share/v0-project/src/routes/_app/*.tsx

# Find all mutation patterns
grep -n "mutationFn:" /vercel/share/v0-project/src/routes/_app/*.tsx

# Get API endpoint list
grep "^### POST\|^### PUT" /vercel/share/v0-project/API_REFERENCE.md
```

## Documentation Created

- `/vercel/share/v0-project/UE_FIX_SUMMARY.md` - Detailed UE fix walkthrough
- `/vercel/share/v0-project/API_FIX_GUIDE.md` - General fix patterns
- `/vercel/share/v0-project/PAGES_VERIFICATION_GUIDE.md` - This file
