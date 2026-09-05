const express = require('express');
const store = require('../store');
const { computeNetBalances, computePairwiseBalances } = require('../balances');

const router = express.Router();

router.get('/', (req, res) => {
  const expenses = store.listExpenses();
  const net = computeNetBalances(expenses);
  const pairwise = computePairwiseBalances(expenses);
  res.json({ net, pairwise });
});

module.exports = router;
