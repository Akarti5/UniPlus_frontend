# UE (Unités d'Enseignement) Page - Fix Summary

## Problems Found

### 1. **Field Name Mismatches**
- Form used `filiere: string` but API expects `filiereId: integer`
- Form used `semestre: number` but API expects `semestreNumero: integer`
- Form used `credits` but API expects `creditsEcts`

### 2. **Computed Field Being Sent**
- Form included `nbMatieres` (number of subjects) which is computed by backend
- This field should NOT be sent to API

### 3. **Enum Values Wrong**
- Form offered: "Fondamentale", "Méthodologique", "Transversale", "Découverte"
- API expects: "fondamentale", "optionnelle", "transversale" (lowercase, different options)

### 4. **Filiere ID Type Issue**
- Form was storing filiere NAME as string
- API needs actual filiere ID as integer for validation

### 5. **PUT Endpoint Restrictions**
- Form was sending `code`, `filiereId`, `semestreNumero` in updates
- API PUT only accepts: `intitule`, `creditsEcts`, `typeUe`
- These immutable fields cannot be updated

## Validation Error Message
The error showed:
```
[{"property":"filiereId","constraints":{"isInt":"filiereId must be an integer number"}},
 {"property":"semestreNumero","constraints":{"max":"...must not be greater than 10","min":"...must not be less than 1","isInt":"...must be an integer"}},
 {"property":"typeUe","constraints":{"isEnum":"...must be one of the following values..."}}]
```

This indicates:
- `filiereId` was string, needs integer
- `semestreNumero` validation failed (likely not 1-10 range)
- `typeUe` enum value was invalid

## Fixes Applied

### FormData Type Updated
```typescript
// BEFORE
type FormData = Omit<Ue, "id" | "filiere"> & { filiere: string };

// AFTER
type FormData = {
  code: string;
  intitule: string;
  filiereId: number | string;      // Now ID, not name
  semestreNumero: number;            // Correct field name
  typeUe: string;
  creditsEcts: number;               // Correct field name
};
```

### Form State Initialization Fixed
- Now properly extracts `filiereId` from filiere object when editing
- Maps filiere name back to ID when loading data

### Form Fields Updated
- Filiere: Now selects by ID instead of name
- Semestre: Now uses 1-10 range instead of 1-6
- Type UE: Now uses lowercase enum values: `fondamentale`, `optionnelle`, `transversale`
- Credits: Field renamed from `credits` to `creditsEcts`
- Removed: `nbMatieres` input field (it's computed)

### Mutations Fixed
```typescript
// POST: Accept all fields needed to create
const add = useMutation({
  mutationFn: (payload: FormData) => {
    // filiereId, semestreNumero, code, intitule, creditsEcts, typeUe all sent
    return ueApi.create(payload);
  },
});

// PUT: Filter out immutable fields
const edit = useMutation({
  mutationFn: ({ id, ...payload }) => {
    const { code, filiereId, semestreNumero, ...data } = payload;
    // Only intitule, creditsEcts, typeUe sent
    return ueApi.update(id, data);
  },
});
```

## Testing

Test both operations:
1. **Create UE** - Should accept all required fields
2. **Edit UE** - Should only allow updating intitule, creditsEcts, typeUe

The validation errors should now disappear.

## Key Learnings

1. **Form State ≠ API Payload** - Keep UI data separate from API data
2. **Check Enum Values** - Always verify exact enum values in API_REFERENCE.md
3. **Type Conversions Matter** - IDs must be integers/numbers, not strings
4. **PUT is More Restrictive** - Always check which fields can be updated
5. **Computed Fields** - Don't send calculated fields; let backend compute them
