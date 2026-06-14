# Inscriptions Form Fix Summary

## Problem
When clicking the "Ajouter" button in the inscriptions form, nothing happened. There were no errors on the frontend console, but the mutation wasn't being triggered.

## Root Cause
In the `FormModal` component's `handleSubmit` function, the `etudiantId` was being extracted from the form data but never passed to the `onSave` callback:

```typescript
// BEFORE (broken):
const { etudiantId, ...rest } = form;
const dataToSend = { ...rest, ...(initial?.id !== undefined ? { id: initial.id } : {}) };
onSave(dataToSend); // etudiantId is lost here!
```

This meant that when the form data reached the mutation, the required `etudiantId` field was missing, causing the validation in the mutation to silently fail without any visible error.

## Solution
Keep `etudiantId` in the form data being sent to `onSave`:

```typescript
// AFTER (fixed):
const dataToSend = { ...form, ...(initial?.id !== undefined ? { id: initial.id } : {}) };
onSave(dataToSend); // etudiantId is now included!
```

## What Changed
- **File**: `/vercel/share/v0-project/src/routes/_app/inscriptions.tsx`
- **Change**: Fixed the `handleSubmit` function in the `FormModal` component to include `etudiantId` in the form data passed to the mutation
- **Result**: The "Ajouter" button now properly submits the form with all required fields, and the API call is made with the correct integer IDs

## Testing
To test the fix:
1. Navigate to the Inscriptions page
2. Click "Nouvelle inscription"
3. Search and select an étudiant from the dropdown
4. Select a groupe
5. Click "Ajouter"

The form should now submit successfully and create the inscription in the database.
