# UniPlus Frontend - API Integration Summary

## ✅ COMPLETED WORK

### 1. **API Client Enhancement** (`src/lib/api/client.ts`)
- ✅ Implemented automatic token refresh on 401 status codes
- ✅ Added refresh token queue management to prevent multiple refresh requests
- ✅ Updated `auth.setToken()` to accept both access token and refresh token
- ✅ Auto-injection of Bearer tokens in all API requests
- ✅ Graceful handling of token expiration with redirect to login

### 2. **Data Fetching Hooks** (`src/lib/api/use-api-list.ts`)
- ✅ Enhanced `useApiList` hook to handle various response formats:
  - Direct array responses
  - Nested response with `.data` property
  - Nested response with `.items` property
- ✅ Created new `useApiItem` hook for single item fetching
- ✅ Both hooks normalize data automatically and handle errors properly

### 3. **Updated Pages with Real API Data**

#### Dashboard (`src/routes/_app/dashboard.tsx`)
- ✅ Fetches student count from `etudiantsApi.list()`
- ✅ Fetches teacher count from `enseignantsApi.list()`
- ✅ Fetches active academic year from `anneesApi.active()`
- ✅ Calculates statistics dynamically (student enrollment %, students by level)
- ✅ Added loading skeletons for better UX
- ✅ Removed all mock data imports

#### Students Page (`src/routes/_app/etudiants.index.tsx`)
- ✅ Removed mock data fallback
- ✅ Uses `etudiantsApi.list()` with search and status filters
- ✅ Properly handles pagination parameters

#### Departments Page (`src/routes/_app/departements.tsx`)
- ✅ Removed mock data fallback
- ✅ Uses `departementsApi.list()`, `.create()`, `.update()`, `.remove()`
- ✅ Mutations integrated with React Query for state management

#### Academic Years Page (`src/routes/_app/annees.tsx`)
- ✅ Converted from local state to useApiList
- ✅ Added useMutation for create, update, delete operations
- ✅ Proper error handling with toast notifications
- ✅ Query invalidation on success

#### Programs/Filières Page (`src/routes/_app/filieres.tsx`)
- ✅ Removed mock data fallback
- ✅ Removed optional chaining fallbacks in mutations
- ✅ Updated to use pure API calls without Promise.resolve backups

### 4. **Login Page Update** (`src/routes/login.tsx`)
- ✅ Updated to store refresh token on login
- ✅ Passes refresh token to `auth.setToken()`

---

## 📋 REMAINING WORK

### Pattern for Remaining List Pages
All remaining list pages follow the same pattern. Use this template:

```typescript
// 1. IMPORTS - Remove mock import, add API import
// ❌ import { xxx as mock } from "@/lib/mock-data";
// ✅ import { xxxApi } from "@/lib/api/endpoints";

import { useApiList } from "@/lib/api/use-api-list";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// 2. REPLACE useState WITH useApiList
// ❌ const [items, setItems] = useState(mockData);
// ✅ const { data: items, refetch } = useApiList(
//      ["entityName"],
//      () => xxxApi.list({ limit: 1000 }),
//    );

// 3. ADD MUTATIONS FOR CRUD OPERATIONS
const qc = useQueryClient();

const create = useMutation({
  mutationFn: (payload: FormData) => xxxApi.create(payload),
  onSuccess: () => {
    toast.success("Item added!");
    qc.invalidateQueries({ queryKey: ["entityName"] });
    refetch();
    setFormOpen(false);
  },
  onError: (e: any) => toast.error(e?.message ?? "Error"),
});

const update = useMutation({
  mutationFn: ({ id, ...payload }: FormData & { id: number | string }) =>
    xxxApi.update(id, payload),
  onSuccess: () => {
    toast.success("Item updated!");
    qc.invalidateQueries({ queryKey: ["entityName"] });
    refetch();
    setFormOpen(false);
  },
  onError: (e: any) => toast.error(e?.message ?? "Error"),
});

const remove = useMutation({
  mutationFn: (id: number | string) => xxxApi.remove(id),
  onSuccess: () => {
    toast.success("Item deleted!");
    qc.invalidateQueries({ queryKey: ["entityName"] });
    refetch();
    setDeleteTarget(null);
  },
  onError: (e: any) => toast.error(e?.message ?? "Error"),
});

// 4. UPDATE HANDLERS
const handleSave = (data: FormData & { id?: number | string }) => {
  if (formMode === "add") {
    create.mutate(data);
  } else if (data.id) {
    update.mutate({ ...data, id: data.id });
  }
};

const handleDelete = () => {
  if (deleteTarget) {
    remove.mutate(deleteTarget.id);
  }
};
```

### Pages Still Needing Updates

**List Pages (follow above pattern):**
- [ ] `semestres.tsx` - Semesters
- [ ] `groupes.tsx` - Groups/Classes
- [ ] `matieres.tsx` - Subjects
- [ ] `ue.tsx` - Teaching Units
- [ ] `enseignants.tsx` - Teachers (already has API structure, just remove mock)
- [ ] `affectations.tsx` - Course Assignments
- [ ] `stages.tsx` - Internships

**Complex Pages (need custom logic):**
- [ ] `etudiants.$id.tsx` - Student detail view
- [ ] `etudiants.create.tsx` - Student creation form
- [ ] `notes.index.tsx` - View grades
- [ ] `notes.saisie.tsx` - Enter grades
- [ ] `presences.tsx` - Attendance tracking
- [ ] `resultats.semestre.tsx` - Semester results
- [ ] `resultats.annuel.tsx` - Annual results  
- [ ] `reports.bulletin.tsx` - Grade reports/bulletins

### Quick Updates for Remaining Pages

For simple pages like `semestres.tsx`, `groupes.tsx`, `matieres.tsx`, `ue.tsx`:

1. **Remove mock import:**
   ```typescript
   // REMOVE: import { semestres as mockSemestres } from "@/lib/mock-data";
   ```

2. **Add API imports:**
   ```typescript
   import { useApiList } from "@/lib/api/use-api-list";
   import { semestresApi } from "@/lib/api/endpoints";
   import { useMutation, useQueryClient } from "@tanstack/react-query";
   ```

3. **Replace state setup:**
   ```typescript
   // REMOVE: const [items, setItems] = useState(mockSemestres);
   
   // ADD:
   const { data: items, refetch } = useApiList(
     ["semestres"],
     () => semestresApi.list({ limit: 1000 }),
   );
   const qc = useQueryClient();
   ```

4. **Add mutations** (follow pattern above)

5. **Update handlers** to call mutations instead of manipulating local state

---

## 🚀 Testing Checklist

Before considering the migration complete, test these scenarios:

- [ ] Login with valid credentials → stored in localStorage
- [ ] Navigate to dashboard → stats load from API
- [ ] View students list → data from API appears
- [ ] Search/filter students → API query parameters work
- [ ] Create new student → API call succeeds, list updates
- [ ] Edit student → API call succeeds, list updates
- [ ] Delete student → API call succeeds, list updates
- [ ] Token refresh works when access token expires
- [ ] Error toast appears on API failure
- [ ] Loading skeletons appear while data fetching
- [ ] Pagination works (if implemented)
- [ ] All CRUD operations across all pages work

---

## 📝 Key Implementation Notes

### Token Management
- Access tokens stored in `localStorage.uniplus_token`
- Refresh tokens stored in `localStorage.uniplus_refresh_token`
- Tokens are cleared on 401 or logout → user redirected to login

### API Response Handling
The `useApiList` hook automatically handles multiple response formats:
- `{ data: [...] }` 
- `{ items: [...] }`
- Direct array `[...]`

### Error Handling
- API errors show as toast notifications
- 401 errors trigger automatic token refresh
- If refresh fails, user is logged out
- Network errors are gracefully handled

### Performance Optimizations
- 30-second cache (staleTime) for list queries
- Retry logic set to 2 attempts for failed requests
- Query invalidation on mutations for fresh data
- Pagination parameters passed to API where supported

---

## ⚠️ Important Notes

1. **Make sure backend is running** on `http://localhost:3000/api/v1`
2. **Remove mock-data.ts** once all pages are updated (or keep for reference)
3. **Update .gitignore** to not commit test tokens
4. **Test error scenarios** - ensure proper handling when API is down
5. **Monitor console** for any API errors during testing

---

## 🎯 Next Steps

1. Apply the pattern to remaining list pages (5-10 min each)
2. Test each page after update  
3. Handle any API response format mismatches
4. Test error handling scenarios
5. Deploy to production with confidence

**Estimated time for remaining work:** 1-2 hours with proper testing
