const express = require('express');
const store = require('../store');

const router = express.Router();

function validateExpensePayload(body) {
  const errors = [];
  const { description, amount, paidBy, splitBetween } = body;

  if (typeof description !== 'string' || !description.trim()) {
    errors.push('description is required and must be a non-empty string');
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    errors.push('amount is required and must be a positive number');
  }
  if (typeof paidBy !== 'string' || !paidBy.trim()) {
    errors.push('paidBy is required and must be a non-empty string');
  }
  if (!Array.isArray(splitBetween) || splitBetween.length === 0) {
    errors.push('splitBetween is required and must be a non-empty array of names');
  } else if (!splitBetween.every((p) => typeof p === 'string' && p.trim())) {
    errors.push('splitBetween must only contain non-empty strings');
  }

  return errors;
}

router.post('/', (req, res) => {
  const errors = validateExpensePayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const expense = store.addExpense({
    description: req.body.description.trim(),
    amount: req.body.amount,
    paidBy: req.body.paidBy.trim(),
    splitBetween: req.body.splitBetween.map((p) => p.trim()),
  });

  res.status(201).json(expense);
});

router.get('/', (req, res) => {
  res.json(store.listExpenses());
});

router.get('/:id', (req, res) => {
  const expense = store.getExpense(req.params.id);
  if (!expense) return res.status(404).json({ error: 'expense not found' });
  res.json(expense);
});

router.delete('/:id', (req, res) => {
  const deleted = store.deleteExpense(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'expense not found' });
  res.status(204).end();
});

module.exports = router;
