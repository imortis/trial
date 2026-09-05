const test = require('node:test');
const assert = require('node:assert/strict');
const { computeNetBalances, computePairwiseBalances } = require('../src/balances');

test('equal split among three people nets out correctly', () => {
  const expenses = [
    { amount: 30, paidBy: 'Alice', splitBetween: ['Alice', 'Bob', 'Carol'] },
  ];
  const net = computeNetBalances(expenses);
  assert.equal(net.Alice, 20);
  assert.equal(net.Bob, -10);
  assert.equal(net.Carol, -10);
});

test('rounding remainder is distributed as whole cents and sums to zero', () => {
  const expenses = [
    { amount: 10, paidBy: 'Alice', splitBetween: ['Alice', 'Bob', 'Carol'] },
  ];
  const net = computeNetBalances(expenses);
  const total = Object.values(net).reduce((a, b) => a + b, 0);
  assert.equal(Math.round(total * 100), 0);
});

test('multiple expenses accumulate net balances', () => {
  const expenses = [
    { amount: 30, paidBy: 'Alice', splitBetween: ['Alice', 'Bob', 'Carol'] },
    { amount: 20, paidBy: 'Bob', splitBetween: ['Alice', 'Bob'] },
  ];
  const net = computeNetBalances(expenses);
  assert.equal(net.Alice, 10);
  assert.equal(net.Bob, 0);
  assert.equal(net.Carol, -10);
});

test('computePairwiseBalances nets a single expense between payer and each participant', () => {
  const expenses = [
    { amount: 30, paidBy: 'Alice', splitBetween: ['Alice', 'Bob', 'Carol'] },
  ];
  const pairwise = computePairwiseBalances(expenses);
  assert.deepEqual(pairwise, [
    { from: 'Bob', to: 'Alice', amount: 10 },
    { from: 'Carol', to: 'Alice', amount: 10 },
  ]);
});

test('computePairwiseBalances nets across multiple expenses between the same pair', () => {
  const expenses = [
    { amount: 30, paidBy: 'Alice', splitBetween: ['Alice', 'Bob'] }, // Bob owes Alice 15
    { amount: 10, paidBy: 'Bob', splitBetween: ['Alice', 'Bob'] }, // Alice owes Bob 5
  ];
  const pairwise = computePairwiseBalances(expenses);
  assert.deepEqual(pairwise, [{ from: 'Bob', to: 'Alice', amount: 10 }]);
});

test('computePairwiseBalances never routes debt through a third person', () => {
  // Alice paid for Bob, Bob paid for Carol. A minimizer might net this to
  // "Carol pays Alice", but pairwise balances must keep both debts distinct
  // since Alice and Carol never shared an expense.
  const expenses = [
    { amount: 10, paidBy: 'Alice', splitBetween: ['Bob'] },
    { amount: 10, paidBy: 'Bob', splitBetween: ['Carol'] },
  ];
  const pairwise = computePairwiseBalances(expenses);
  assert.deepEqual(pairwise, [
    { from: 'Bob', to: 'Alice', amount: 10 },
    { from: 'Carol', to: 'Bob', amount: 10 },
  ]);
});

test('computePairwiseBalances omits pairs that are fully settled', () => {
  const expenses = [
    { amount: 20, paidBy: 'Alice', splitBetween: ['Alice', 'Bob'] },
    { amount: 20, paidBy: 'Bob', splitBetween: ['Alice', 'Bob'] },
  ];
  assert.deepEqual(computePairwiseBalances(expenses), []);
});
