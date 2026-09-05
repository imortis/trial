# Design

## Backend (`backend/`)
Node.js + Express, plain JSON REST API, in-memory data store (no DB yet).

- `src/store.js` — in-memory `expenses` array + CRUD helpers (`addExpense`, `listExpenses`, `getExpense`, `deleteExpense`, `listPeople`). `listPeople` derives names from expense payers/participants rather than a separate people table.
- `src/balances.js` — pure functions, no I/O:
  - `computeNetBalances(expenses)` — per-person net balance (positive = owed, negative = owes). Converts dollars to integer cents internally to avoid float drift; equal splits distribute any rounding remainder (pennies) to the first N participants in `splitBetween`.
  - `computePairwiseBalances(expenses)` — net balance between each pair of people who've shared an expense (e.g. "Bob owes Alice $10"), computed directly from expense history. Deliberately does NOT minimize the number of settle-up transactions or route debt through a third person - if A owes B and B owes C, both stay separate rather than collapsing to "A owes C".
- `src/routes/expenses.js` — `POST/GET/GET:id/DELETE:id /expenses`, with payload validation (description, positive amount, paidBy, non-empty splitBetween).
- `src/routes/balances.js` — `GET /balances` -> `{ net, pairwise }`.
- `src/routes/people.js` — `GET /people`.
- `src/app.js` / `src/server.js` — Express app factory (for testability, with CORS support) + entrypoint, `PORT` env var, default 3001.

## Frontend (`frontend/`)
React 18 + Vite SPA with Tailwind CSS and Lucide React icons.

NOTE: a teammate's task for this was marked "done" in the hub but as of this writing no frontend/ files have actually been pushed to the shared git repo - only the .hub task-completion record exists. Treat the description below as the *intended* design until frontend/ actually appears in git.

- `src/api/client.js` — Centralized API service with endpoints for `/health`, `/expenses`, `/balances`, `/people`.
- `src/components/Navbar.jsx` — Header with branding, live backend connectivity status badge, and refresh trigger.
- `src/components/StatsCards.jsx` — Summary cards displaying total group spend, active members, settle-up count, and top contributor.
- `src/components/ExpenseForm.jsx` — Expense entry form with quick category tags, custom/existing payer selection, multi-select split chips, and live per-person cost breakdown.
- `src/components/ExpenseList.jsx` — Searchable and filterable chronological transaction timeline with category badges and deletion.
- `src/components/BalancesView.jsx` — Tabbed view containing "who pays who" balance cards and net balance breakdown bars. NOTE: should be updated to consume the `pairwise` field (not `settlements`, which no longer exists) once the frontend code is actually available to edit.
- `src/App.jsx` — Root dashboard state coordinator with optimistic syncing, loading states, and toast notifications.

## Key Decisions
- **Equal split only for v1.** Custom/percentage splits are a likely next step but out of scope until asked for.
- **Money in cents internally in backend.** Avoids floating point drift ($0.1 + $0.2 bug); API speaks dollars in requests/responses.
- **Pairwise balances, not minimized settlements.** `GET /balances` exposes raw net-per-person balances plus direct pairwise debts between people who've actually shared an expense. A prior version used greedy debt-minimization (routing debt through third parties to reduce transaction count) but this was intentionally replaced per user request for simplicity/transparency.
- **Dynamic participant creation in UI.** Users can add new people directly from the expense form without needing a separate member onboarding flow.
- **CORS-enabled backend + Vite Proxy.** Enables smooth local development across ports (5173 and 3001).

## Not Yet Built
- Persistence (currently resets on restart).
- Custom/unequal splits, multiple groups, authentication.
- Frontend code itself is not yet present in the shared git repo (see NOTE above) even though its task is marked done in the hub.
