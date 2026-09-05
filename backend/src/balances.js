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

// Direct, unsimplified balance between each pair of people who have shared
// an expense: how much one person owes the other, netted across every
// expense that involved both of them. Unlike a global debt-minimization
// pass, this never routes money through a third person.
function computePairwiseBalances(expenses) {
  const owedCents = new Map(); // `${debtor}||${creditor}` -> cents debtor owes creditor
  const addOwed = (debtor, creditor, delta) => {
    const key = `${debtor}||${creditor}`;
    owedCents.set(key, (owedCents.get(key) || 0) + delta);
  };

  for (const { amount, paidBy, splitBetween } of expenses) {
    const totalCents = toCents(amount);
    const n = splitBetween.length;
    const baseShare = Math.floor(totalCents / n);
    const remainder = totalCents - baseShare * n;

    splitBetween.forEach((person, i) => {
      if (person === paidBy) return; // no debt owed to yourself
      const share = baseShare + (i < remainder ? 1 : 0);
      addOwed(person, paidBy, share);
    });
  }

  const seenPairs = new Set();
  const balances = [];

  for (const key of owedCents.keys()) {
    const [a, b] = key.split('||');
    const pairKey = [a, b].sort().join('||');
    if (seenPairs.has(pairKey)) continue;
    seenPairs.add(pairKey);

    const aOwesB = owedCents.get(`${a}||${b}`) || 0;
    const bOwesA = owedCents.get(`${b}||${a}`) || 0;
    const net = aOwesB - bOwesA;

    if (net > 0) balances.push({ from: a, to: b, amount: toDollars(net) });
    else if (net < 0) balances.push({ from: b, to: a, amount: toDollars(-net) });
  }

  return balances.sort((x, y) => x.from.localeCompare(y.from) || x.to.localeCompare(y.to));
}

module.exports = { computeNetBalances, computePairwiseBalances };
