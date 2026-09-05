import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowRightLeft,
  Copy,
  Check,
  PartyPopper,
  Scale,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import MemberBalancesSummary from './MemberBalancesSummary';

export default function BalancesView({
  balances = { net: {}, pairwise: [] },
  expenses = [],
  people = [],
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'settlements' | 'net'

  const settlements = balances?.pairwise || [];
  const netEntries = Object.entries(balances?.net || {}).sort((a, b) => b[1] - a[1]);

  const copySettlementsSummary = () => {
    if (settlements.length === 0) return;
    const lines = settlements.map(
      (s) => `• ${s.from} pays ${s.to} $${Number(s.amount).toFixed(2)}`
    );
    const text = `💸 Expense Splitter — Settle-Up Summary:\n\n${lines.join('\n')}\n\nGenerated via SplitEase`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find maximum absolute balance for visual progress scaling
  const maxAbsBalance = Math.max(
    ...netEntries.map(([_, val]) => Math.abs(val)),
    1
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <span>Balances & Settle-Up</span>
            </h2>
            <p className="text-xs text-slate-500">
              Overview of who paid, who owes, and simplified transfers
            </p>
          </div>
        </div>

        {/* 3-Way Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex-1 min-w-[100px] py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Summary ({people.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settlements')}
            className={`flex-1 min-w-[100px] py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'settlements'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Settle Up ({settlements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('net')}
            className={`flex-1 min-w-[100px] py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'net'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Meters ({netEntries.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Comprehensive Summary of Everyone's Balances */}
      {activeTab === 'summary' && (
        <MemberBalancesSummary
          expenses={expenses}
          balances={balances}
          people={people}
        />
      )}

      {/* Tab 2: Simplified Settlements ("Who Pays Who") */}
      {activeTab === 'settlements' && (
        <div>
          {settlements.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <PartyPopper className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                Everyone is fully settled up!
              </h3>
              <p className="text-xs text-emerald-700 max-w-xs mx-auto">
                No debts remaining among group members. Add more expenses to see balances.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Balances between people who've shared an expense:</span>
                <button
                  type="button"
                  onClick={copySettlementsSummary}
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied to clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy summary</span>
                    </>
                  )}
                </button>
              </div>

              {settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 flex items-center justify-between gap-2 sm:gap-4 shadow-2xs hover:border-indigo-200 transition-all"
                >
                  {/* Debtor (From) */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200">
                      {s.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-slate-400 block leading-none mb-0.5">Owes</span>
                      <span className="text-sm font-bold text-slate-900 truncate block">
                        {s.from}
                      </span>
                    </div>
                  </div>

                  {/* Transfer Action & Amount */}
                  <div className="flex flex-col items-center px-2">
                    <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs sm:text-sm tracking-tight shadow-2xs flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 hidden sm:inline" />
                      <span>${Number(s.amount).toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">pays</span>
                  </div>

                  {/* Creditor (To) */}
                  <div className="flex items-center gap-2.5 min-w-0 justify-end text-right">
                    <div className="min-w-0">
                      <span className="text-xs text-slate-400 block leading-none mb-0.5">Receives</span>
                      <span className="text-sm font-bold text-slate-900 truncate block">
                        {s.to}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                      {s.to.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Net Balances per Person */}
      {activeTab === 'net' && (
        <div>
          {netEntries.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              No participant balance data available yet.
            </p>
          ) : (
            <div className="space-y-3">
              {netEntries.map(([name, netAmount]) => {
                const isPositive = netAmount > 0.005;
                const isZero = Math.abs(netAmount) <= 0.005;
                const absAmt = Math.abs(netAmount).toFixed(2);
                const barWidth = `${Math.min(100, (Math.abs(netAmount) / maxAbsBalance) * 100)}%`;

                return (
                  <div
                    key={name}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                            isZero
                              ? 'bg-slate-100 text-slate-600'
                              : isPositive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{name}</span>
                      </div>

                      {/* Net Badge */}
                      <div className="text-right">
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isZero
                              ? 'bg-slate-100 text-slate-600'
                              : isPositive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPositive && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                          {!isPositive && !isZero && <TrendingDown className="w-3 h-3 text-rose-600" />}
                          <span>
                            {isZero
                              ? 'Settled ($0.00)'
                              : isPositive
                              ? `Gets back +$${absAmt}`
                              : `Owes -$${absAmt}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Proportional Balance Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isZero
                            ? 'bg-slate-300'
                            : isPositive
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: isZero ? '0%' : barWidth }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
