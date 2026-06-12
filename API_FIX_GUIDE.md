# API Payload Fix Guide

## The Problem: "Error Occurred" on POST/PUT

When you see "error occurred" on Create/Update operations, the root cause is **sending fields that the API doesn't accept** in the request payload.

## Why It Happens

Forms collect data for **UI display** (like derived/computed fields), but the **API only accepts specific fields**. You must filter before sending.

### Example: Groupes Page

**Form collects:**
```typescript
{
  nom: "L1-A",
  filiereId: 5,
  anneeScolaireId: 3,
  niveauAnnee: "L1",
  capaciteMax: 50,
  nbInscrits: 12  // ❌ Computed from database, NOT API field
}
```

**API POST expects:**
```json
{
  "filiereId": 5,
  "anneeScolaireId": 3,
  "nom": "L1-A",
  "niveauAnnee": "L1",
  "capaciteMax": 50
}
```

**API PUT expects:**
```json
{
  "nom": "L1-A",
  "niveauAnnee": "L1",
  "capaciteMax": 50
  // ❌ filiereId and anneeScolaireId NOT allowed
}
```

## The Fix Pattern

### Step 1: Check API_REFERENCE.md

Find your endpoint (e.g., `POST /groupes`, `PUT /groupes/:id`) and note which fields are **"required"** or **"optional"**.

```bash
grep -A 20 "### POST /groupes" /vercel/share/v0-project/API_REFERENCE.md
grep -A 20 "### PUT /groupes" /vercel/share/v0-project/API_REFERENCE.md
```

### Step 2: Identify Extra Fields

Compare what's in your **FormData type** with what the API accepts:

```typescript
// What form has
type FormData = {
  nom: string;
  filiereId: number;      // ✅ In POST, ❌ NOT in PUT
  anneeScolaireId: number; // ✅ In POST, ❌ NOT in PUT
  niveauAnnee: string;    // ✅ In both
  capaciteMax: number;    // ✅ In both
  nbInscrits: number;     // ❌ NEVER in API (computed field)
}
```

### Step 3: Filter in Two Places

#### Location A: In `handleSave` function (for PUT)

Filter out extra fields BEFORE calling the mutation:

```typescript
const handleSave = (data: FormData & { id?: Groupe["id"] }) => {
  if (formMode === "add") {
    add.mutate(data as FormData);  // No filter needed for POST
  } else if (data.id !== undefined) {
    const { id, filiereId, anneeScolaireId, nbInscrits, ...updateData } = data;
    // updateData now has only: nom, niveauAnnee, capaciteMax
    edit.mutate({ id, ...updateData });
  }
};
```

#### Location B: In mutation `mutationFn` (for POST)

Filter before sending to API:

```typescript
const add = useMutation({
  mutationFn: (payload: FormData) => {
    const { nbInscrits, ...data } = payload;
    // data now has: filiereId, anneeScolaireId, nom, niveauAnnee, capaciteMax
    return groupesApi.create(data);
  },
  // ... rest of mutation
});
```

## Quick Checklist for Each Page

For any page with POST/PUT errors:

1. ✅ Open `API_REFERENCE.md`
2. ✅ Find your endpoint (POST and PUT sections)
3. ✅ Note the Request Body fields
4. ✅ Read your page's `FormData` type definition
5. ✅ Identify fields in FormData but NOT in API spec
6. ✅ Filter those fields in mutations before sending

## Common Fields to Watch For

These fields are usually computed/UI-only and should be filtered:

- `nbInscrits` - Count of enrolled students (computed)
- `statut` - Calculated status (computed)
- `actif` - Sometimes in response but not in POST/PUT
- `createdAt` - Database timestamp (never sent)
- `id` - Already in URL, remove from payload
- Display object fields like `filiere`, `anneeScolaire` - Use their `*Id` versions instead

## Testing Your Fix

1. Open the page in your app
2. Try to **Create** (POST) - should succeed
3. Try to **Update** (PUT) - should succeed
4. Both should show success toast, not "error occurred"

## Real Example from Groupes

**Before fix:**
```typescript
// ❌ Sends all form data including nbInscrits
const handleSave = (data) => {
  edit.mutate({ id: data.id, ...data }); // Sends nbInscrits to API
};
```

**After fix:**
```typescript
// ✅ Filters before sending
const handleSave = (data) => {
  const { id, nbInscrits, filiereId, anneeScolaireId, ...updateData } = data;
  edit.mutate({ id, ...updateData }); // Only nom, niveauAnnee, capaciteMax
};
```

## Need More Help?

1. Check what error message the API returns (open DevTools Network tab)
2. Compare the request payload with API_REFERENCE.md specs
3. Filter the mismatched fields
4. Test again

---

**Key Takeaway:** Always filter form data to match the API spec before calling mutations. The API is strict about which fields it accepts.
