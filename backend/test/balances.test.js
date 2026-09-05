const test = require('node:test');
const assert = require('node:assert/strict');
const { computeNetBalances, simplifyDebts } = require('../src/balances');

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

test('simplifyDebts settles a debtor against a creditor', () => {
  const settlements = simplifyDebts({ Alice: 20, Bob: -10, Carol: -10 });
  assert.equal(settlements.length, 2);
  const total = settlements.reduce((sum, s) => sum + s.amount, 0);
  assert.equal(total, 20);
  for (const s of settlements) assert.equal(s.to, 'Alice');
});

test('simplifyDebts produces no transactions when everyone is settled', () => {
  assert.deepEqual(simplifyDebts({ Alice: 0, Bob: 0 }), []);
});
