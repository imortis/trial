const { randomUUID } = require('crypto');

// In-memory data store. Swap for a real DB later without changing the
// route/service contract below.
const expenses = [];

function addExpense({ description, amount, paidBy, splitBetween }) {
  const expense = {
    id: randomUUID(),
    description,
    amount,
    paidBy,
    splitBetween,
    createdAt: new Date().toISOString(),
  };
  expenses.push(expense);
  return expense;
}

function listExpenses() {
  return [...expenses].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function getExpense(id) {
  return expenses.find((e) => e.id === id);
}

function deleteExpense(id) {
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return false;
  expenses.splice(index, 1);
  return true;
}

function listPeople() {
  const people = new Set();
  for (const e of expenses) {
    people.add(e.paidBy);
    for (const person of e.splitBetween) people.add(person);
  }
  return [...people].sort();
}

module.exports = { addExpense, listExpenses, getExpense, deleteExpense, listPeople };
