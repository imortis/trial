const express = require('express');
const expensesRouter = require('./routes/expenses');
const balancesRouter = require('./routes/balances');
const peopleRouter = require('./routes/people');

function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/expenses', expensesRouter);
  app.use('/balances', balancesRouter);
  app.use('/people', peopleRouter);

  app.use((req, res) => res.status(404).json({ error: 'not found' }));

  return app;
}

module.exports = createApp;
