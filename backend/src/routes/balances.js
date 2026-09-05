const express = require('express');
const store = require('../store');
const { computeNetBalances, simplifyDebts } = require('../balances');

const router = express.Router();

router.get('/', (req, res) => {
  const net = computeNetBalances(store.listExpenses());
  const settlements = simplifyDebts(net);
  res.json({ net, settlements });
});

module.exports = router;
