# Design

## Backend (`backend/`)
Node.js + Express, plain JSON REST API, in-memory data store (no DB yet).

- `src/store.js` — in-memory `expenses` array + CRUD helpers (`addExpense`, `listExpenses`, `getExpense`, `deleteExpense`, `listPeople`). `listPeople` derives names from expense payers/participants rather than a separate people table.
- `src/balances.js` — pure functions, no I/O:
  - `computeNetBalances(expenses)` — per-person net balance (positive = owed, negative = owes). Converts dollars to integer cents internally to avoid float drift; equal splits distribute any rounding remainder (pennies) to the first N participants in `splitBetween`.
  - `simplifyDebts(netBalances)` — greedy largest-debtor-vs-largest-creditor match, producing a minimal `{from, to, amount}` settle-up list instead of a full pairwise ledger.
- `src/routes/expenses.js` — `POST/GET/GET:id/DELETE:id /expenses`, with payload validation (description, positive amount, paidBy, non-empty splitBetween).
- `src/routes/balances.js` — `GET /balances` → `{ net, settlements }`.
- `src/routes/people.js` — `GET /people`.
- `src/app.js` / `src/server.js` — Express app factory (for testability) + entrypoint, `PORT` env var, default 3001.

## Key decisions
- **Equal split only for v1.** Custom/percentage splits are a likely next step but out of scope until asked for.
- **Money in cents internally.** Avoids the classic $0.1 + $0.2 float bug; API still speaks dollars (numbers) in requests/responses.
- **Debt simplification, not a raw ledger.** `GET /balances` returns both the raw net balance per person and a minimized settlement list, since "who owes who" is more useful as "pay X to Y" than a full transaction history.
- **People are implicit.** No separate "add person" endpoint — anyone named in an expense becomes a known person. Keeps the API surface small; revisit if the frontend needs a people-management screen.
- **In-memory store isolated behind `store.js`.** Swapping in a real DB later should only require changing that one file.

## Not yet built
- Frontend (UI) — next task.
- Persistence (currently resets on restart).
- Custom/unequal splits, multiple groups, auth.
