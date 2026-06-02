# Vite + Supabase Migration Plan (Parallel Agent Workflow)

This plan outlines how you and Claude (acting as a team of parallel agents) can migrate the single `untapped-market.html` prototype into a production-ready **Vite + React + Supabase** architecture.

By following the `/dispatching-parallel-agents` methodology, we will break the migration into strictly independent domains so that multiple AI agents can work concurrently without causing merge conflicts or breaking shared state.

## User Review Required
Please review the division of labor in **Phase 2**. Do you agree with the boundaries set for each agent? Once approved, we can begin executing Phase 1 immediately.

---

## Phase 1: The Foundation (Sequential - 1 Agent)
Before agents can work in parallel, we need a shared workspace. 

**Task:** Scaffold the project.
1. Run `npx -y create-vite-app@latest untapped-market --template react-ts` (or standard Vite setup).
2. Install dependencies: `react-router-dom`, `zustand`, `@supabase/supabase-js`, `lucide-react`, and Tailwind CSS setup.
3. Establish the agreed-upon folder structure:
   ```text
   src/
     ├── components/  (UI components)
     ├── pages/       (Route components)
     ├── store/       (Zustand + Data)
     ├── lib/         (Supabase client, utils)
     └── App.tsx      (Router)
   ```

---

## Phase 2: Parallel Extraction (Concurrent Agents)
Once Phase 1 is merged, you can dispatch 3 independent agents to do the heavy lifting in parallel. Because they are editing completely separate directories, there will be no conflicts.

### 🤖 Agent 1: The Data & State Agent
**Scope:** `src/store/` and `supabase/`
**Goal:** Move the hardcoded data to a global state manager and prepare the database schema.
**Tasks:**
1. Extract the TypeScript interfaces (`Strain`, `Dispensary`, `TripReport`) from the HTML file into `src/store/types.ts`.
2. Create `src/store/useStore.ts` using Zustand to manage `bookmarks` and the mock user state.
3. Extract `STRAINS`, `DISPENSARIES`, and `TRIP_REPORTS` into `src/store/mockData.ts`.
4. Draft the Supabase SQL schema (`supabase/schema.sql`) for when we transition from mock data to the real database.

### 🤖 Agent 2: The UI Component Agent
**Scope:** `src/components/` and `src/index.css`
**Goal:** Extract reusable UI pieces and styling.
**Tasks:**
1. Extract the ~1,200 lines of CSS from the HTML `<style>` block into `src/index.css`. Ensure all CSS variables (`--bg`, `--accent`) are preserved.
2. Extract the `Nav` component into `src/components/Nav.tsx`.
3. Extract the `StrainCard` component into `src/components/StrainCard.tsx`.
4. Extract the Leaflet `DispensaryMap` logic into `src/components/DispensaryMap.tsx`.

### 🤖 Agent 3: The Pages & Routing Agent
**Scope:** `src/pages/` and `src/App.tsx`
**Goal:** Break the giant HTML file into modular page components and wire up the router.
**Tasks:**
1. Setup `react-router-dom` inside `src/App.tsx` with routes for `/`, `/catalog`, `/strain/:id`, `/finder`, `/library`, `/explore`, and `/premium`.
2. Extract `HomePage`, `CatalogPage`, `FinderPage`, `LibraryPage`, `ExplorePage`, and `PremiumPage` into their respective files in `src/pages/`.
3. Extract `StrainDetailPage` into `src/pages/StrainDetailPage.tsx`.
4. **Constraint:** Use placeholder imports for components and data until Phase 3.

---

## Phase 3: Integration & Wiring (Sequential)
Once all three agents return their completed tasks:

1. **Review & Merge:** Ensure no agents hallucinated cross-dependencies.
2. **Wire it up:** 
   - Connect the pages (Agent 3) to the `useStore` data (Agent 1).
   - Import the UI components (Agent 2) into the pages (Agent 3).
3. **Verify:** Run `npm run dev` to ensure the app looks and behaves exactly like the V1 prototype, but is now fully modular.

---

## Verification Plan
1. **Automated:** Run TypeScript compiler (`tsc --noEmit`) to ensure interfaces match across the separated files.
2. **Visual Check:** Click through all 7 routes to verify React Router maintains state.
3. **Feature Parity Check:** Verify the Leaflet map still renders, and the Terpene charts still calculate their widths correctly using the extracted CSS variables.
