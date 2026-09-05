import React from 'react';
import { DollarSign, ReceiptText, Users, ArrowRightLeft, TrendingUp } from 'lucide-react';

export default function StatsCards({ expenses = [], balances = { net: {}, pairwise: [] }, people = [] }) {
  const totalSpend = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const expenseCount = expenses.length;
  const memberCount = people.length;
  const settlementCount = balances?.pairwise?.length || 0;

  // Find top payer
  const payerTotals = {};
  expenses.forEach((e) => {
    payerTotals[e.paidBy] = (payerTotals[e.paidBy] || 0) + (Number(e.amount) || 0);
  });
  let topPayer = null;
  let topAmount = 0;
  for (const [payer, amt] of Object.entries(payerTotals)) {
    if (amt > topAmount) {
      topAmount = amt;
      topPayer = payer;
    }
  }

  const cards = [
    {
      title: 'Total Group Spend',
      value: `$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${expenseCount} transaction${expenseCount === 1 ? '' : 's'} recorded`,
      icon: DollarSign,
      color: 'indigo',
      bg: 'bg-indigo-500/10 text-indigo-600',
    },
    {
      title: 'Active Members',
      value: memberCount,
      subtitle: memberCount === 0 ? 'No participants yet' : `${memberCount} people sharing costs`,
      icon: Users,
      color: 'blue',
      bg: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Open Balances',
      value: settlementCount,
      subtitle: settlementCount === 0 ? 'All settled up! 🎉' : `${settlementCount} balance${settlementCount === 1 ? '' : 's'} to square off`,
      icon: ArrowRightLeft,
      color: 'emerald',
      bg: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Top Contributor',
      value: topPayer ? topPayer : '—',
      subtitle: topPayer ? `Paid $${topAmount.toFixed(2)} total` : 'No expenses yet',
      icon: TrendingUp,
      color: 'amber',
      bg: 'bg-amber-500/10 text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</span>
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {card.value}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
