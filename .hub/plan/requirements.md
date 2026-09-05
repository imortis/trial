# Requirements

## What
An expense splitter for a group of friends.

- Add an expense: who paid, the amount, and who it's split between.
- See a simplified "who owes who" summary (net balances between people), not just a raw list of transactions.

## Scope (current)
- Backend only for now (REST API). Frontend to follow in a later task.
- Splits are equal-share among the selected participants for v1 (no custom/percentage splits yet).
- People are identified by name (no auth/accounts).

## Non-goals (for now)
- No persistence beyond the process (in-memory store) - can swap for a DB later.
- No auth, no multi-group support, no currency handling beyond a single implicit currency.
