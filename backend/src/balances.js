// All money is handled in integer cents internally to avoid floating point
// drift, then converted back to a rounded dollar amount at the boundary.

function toCents(amount) {
  return Math.round(amount * 100);
}

function toDollars(cents) {
  return Math.round(cents) / 100;
}

// Net balance per person across all expenses.
// Positive = this person is owed money overall. Negative = they owe money.
function computeNetBalances(expenses) {
  const netCents = new Map();
  const addNet = (person, delta) => netCents.set(person, (netCents.get(person) || 0) + delta);

  for (const { amount, paidBy, splitBetween } of expenses) {
    const totalCents = toCents(amount);
    const n = splitBetween.length;
    const baseShare = Math.floor(totalCents / n);
    const remainder = totalCents - baseShare * n;

    addNet(paidBy, totalCents);

    splitBetween.forEach((person, i) => {
      // Distribute the leftover penny(s) from rounding to the first
      // `remainder` participants so shares sum exactly to totalCents.
      const share = baseShare + (i < remainder ? 1 : 0);
      addNet(person, -share);
    });
  }

  const result = {};
  for (const [person, cents] of netCents.entries()) {
    result[person] = toDollars(cents);
  }
  return result;
}

// Reduces net balances to a minimal set of settle-up transactions
// (greedy match of largest debtor to largest creditor).
function simplifyDebts(netBalancesByPerson) {
  const creditors = [];
  const debtors = [];

  for (const [person, amount] of Object.entries(netBalancesByPerson)) {
    const cents = toCents(amount);
    if (cents > 0) creditors.push({ person, cents });
    else if (cents < 0) debtors.push({ person, cents: -cents });
  }

  creditors.sort((a, b) => b.cents - a.cents);
  debtors.sort((a, b) => b.cents - a.cents);

  const transactions = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settled = Math.min(debtor.cents, creditor.cents);

    if (settled > 0) {
      transactions.push({ from: debtor.person, to: creditor.person, amount: toDollars(settled) });
    }

    debtor.cents -= settled;
    creditor.cents -= settled;

    if (debtor.cents === 0) i += 1;
    if (creditor.cents === 0) j += 1;
  }

  return transactions;
}

module.exports = { computeNetBalances, simplifyDebts };
