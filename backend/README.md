# Expense Splitter — Backend

REST API for tracking shared group expenses and settling up.

## Run

```
npm install
npm start          # listens on PORT (default 3001)
npm run dev         # auto-restart on change
npm test
```

## API

### `POST /expenses`
Add an expense.

Body:
```json
{ "description": "Dinner", "amount": 30, "paidBy": "Alice", "splitBetween": ["Alice", "Bob", "Carol"] }
```
Splits equally among everyone in `splitBetween` (include `paidBy` in that list if they also owe a share). Returns the created expense (201).

### `GET /expenses`
List all expenses, oldest first.

### `GET /expenses/:id`
Get one expense.

### `DELETE /expenses/:id`
Remove an expense.

### `GET /people`
List every distinct name that has appeared in an expense (as payer or participant).

### `GET /balances`
```json
{
  "net": { "Alice": 10, "Bob": 0, "Carol": -10 },
  "pairwise": [{ "from": "Carol", "to": "Alice", "amount": 10 }]
}
```
- `net`: each person's overall balance across everyone (positive = owed money, negative = owes money).
- `pairwise`: the net balance between each pair of people who've shared an expense, e.g. "Carol owes Alice $10". This is a direct, unsimplified debt between the two — it never routes money through a third person, even if that would reduce the number of payments.

## Notes
- Data is in-memory only — it resets when the server restarts. Swap `src/store.js` for a real DB later without touching the routes or balance logic.
- Money is handled in integer cents internally so equal splits never drift from floating-point rounding; any leftover penny from an uneven split goes to the first participants in the list.
