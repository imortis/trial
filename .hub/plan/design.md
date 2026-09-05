# Design

## Backend (`backend/`)
Node.js + Express, plain JSON REST API, in-memory data store (no DB yet).

- `src/store.js` — in-memory `expenses` array + CRUD helpers (`addExpense`, `listExpenses`, `getExpense`, `deleteExpense`, `listPeople`). `listPeople` derives names from expense payers/participants rather than a separate people table.
- `src/balances.js` — pure functions, no I/O:
  - `computeNetBalances(expenses)` — per-person net balance (positive = owed, negative = owes). Converts dollars to integer cents internally to avoid float drift; equal splits distribute any rounding remainder (pennies) to the first N participants in `splitBetween`.
  - `simplifyDebts(netBalances)` — greedy largest-debtor-vs-largest-creditor match, producing a minimal `{from, to, amount}` settle-up list instead of a full pairwise ledger.
- `src/routes/expenses.js` — `POST/GET/GET:id/DELETE:id /expenses`, with payload validation (description, positive amount, paidBy, non-empty splitBetween).
- `src/routes/balances.js` — `GET /balances` -> `{ net, settlements }`.
- `src/routes/people.js` — `GET /people`.
- `src/app.js` / `src/server.js` — Express app factory (for testability, with CORS support) + entrypoint, `PORT` env var, default 3001.

## Frontend (`frontend/`)
React 18 + Vite SPA with Tailwind CSS and Lucide React icons.

- `src/api/client.js` — Centralized API service with endpoints for `/health`, `/expenses`, `/balances`, `/people`.
- `src/components/Navbar.jsx` — Header with branding, live backend connectivity status badge, and refresh trigger.
- `src/components/StatsCards.jsx` — Summary cards displaying total group spend, active members, settle-up count, and top contributor.
- `src/components/ExpenseForm.jsx` — Expense entry form with quick category tags, custom/existing payer selection, multi-select split chips, and live per-person cost breakdown.
- `src/components/ExpenseList.jsx` — Searchable and filterable chronological transaction timeline with category badges and deletion.
- `src/components/BalancesView.jsx` — Tabbed view containing simplified debt settlement payment cards ("who pays who" with one-click copy) and net balance breakdown bars.
- `src/App.jsx` — Root dashboard state coordinator with optimistic syncing, loading states, and toast notifications.

## Key Decisions
- **Equal split only for v1.** Custom/percentage splits are a likely next step but out of scope until asked for.
- **Money in cents internally in backend.** Avoids floating point drift ($0.1 + $0.2 bug); API speaks dollars in requests/responses.
- **Debt simplification.** Exposes both raw net balances and greedy debtor-creditor settlement transfers.
- **Dynamic participant creation in UI.** Users can add new people directly from the expense form without needing a separate member onboarding flow.
- **CORS-enabled backend + Vite Proxy.** Enables smooth local development across ports (5173 and 3001).

## Not Yet Built
- Persistence (currently resets on restart).
- Custom/unequal splits, multiple groups, authentication.
