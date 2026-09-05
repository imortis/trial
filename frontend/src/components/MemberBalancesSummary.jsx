import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  PieChart,
  Copy,
  Check,
} from 'lucide-react';

export default function MemberBalancesSummary({
  expenses = [],
  balances = { net: {}, pairwise: [] },
  people = [],
}) {
  const [copied, setCopied] = useState(false);

  // Compute per-person detailed metrics
  const totalGroupSpend = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const memberStats = people.map((person) => {
    // Total amount paid by this person
    const totalPaid = expenses
      .filter((e) => e.paidBy === person)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Total share consumed by this person across all expenses
    let totalShare = 0;
    expenses.forEach((e) => {
      if (Array.isArray(e.splitBetween) && e.splitBetween.includes(person)) {
        totalShare += (Number(e.amount) || 0) / e.splitBetween.length;
      }
    });

    // Net balance from backend or computed
    const net = balances?.net?.[person] !== undefined ? balances.net[person] : totalPaid - totalShare;

    // Incoming and outgoing pairwise balances
    const outgoing = (balances?.pairwise || []).filter((s) => s.from === person);
    const incoming = (balances?.pairwise || []).filter((s) => s.to === person);

    return {
      name: person,
      totalPaid,
      totalShare,
      net,
      outgoing,
      incoming,
    };
  });

  // Sort by highest net balance (creditors first, debtors last)
  memberStats.sort((a, b) => b.net - a.net);

  const handleCopySummary = () => {
    if (memberStats.length === 0) return;
    const lines = memberStats.map((m) => {
      const netStr =
        m.net > 0.005
          ? `Gets back +$${m.net.toFixed(2)}`
          : m.net < -0.005
          ? `Owes -$${Math.abs(m.net).toFixed(2)}`
          : `Settled ($0.00)`;
      return `• ${m.name}: Paid $${m.totalPaid.toFixed(2)} | Share $${m.totalShare.toFixed(2)} | Net: ${netStr}`;
    });
    const text = `📊 Group Balances Summary (Total Spend: $${totalGroupSpend.toFixed(2)}):\n\n${lines.join('\n')}\n\nGenerated via SplitEase`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (people.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
        <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">No members recorded yet.</p>
        <p className="text-[11px] text-slate-400">Add an expense to see everyone's balance summary.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar with copy action */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Detailed financial standing for each participant:</span>
        <button
          type="button"
          onClick={handleCopySummary}
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied table!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy summary</span>
            </>
          )}
        </button>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 gap-3">
        {memberStats.map((member) => {
          const isCreditor = member.net > 0.005;
          const isDebtor = member.net < -0.005;
          const isEven = !isCreditor && !isDebtor;
          const absNet = Math.abs(member.net).toFixed(2);

          return (
            <div
              key={member.name}
              className={`p-4 rounded-xl border transition-all ${
                isCreditor
                  ? 'bg-gradient-to-r from-emerald-50/40 via-white to-white border-emerald-200/80 hover:border-emerald-300'
                  : isDebtor
                  ? 'bg-gradient-to-r from-rose-50/40 via-white to-white border-rose-200/80 hover:border-rose-300'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Main Member Row */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border ${
                      isCreditor
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : isDebtor
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{member.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Paid <strong className="text-slate-700">${member.totalPaid.toFixed(2)}</strong> • Share <strong className="text-slate-700">${member.totalShare.toFixed(2)}</strong>
                    </p>
                  </div>
                </div>

                {/* Net Balance Status */}
                <div className="text-right shrink-0">
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isCreditor
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isDebtor
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isCreditor && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                    {isDebtor && <TrendingDown className="w-3 h-3 text-rose-600" />}
                    {isEven && <CheckCircle2 className="w-3 h-3 text-slate-500" />}
                    <span>
                      {isCreditor && `Gets back +$${absNet}`}
                      {isDebtor && `Owes -$${absNet}`}
                      {isEven && 'Settled ($0.00)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settlement Instructions Sub-card */}
              {(member.outgoing.length > 0 || member.incoming.length > 0) && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
                  {member.outgoing.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-rose-50/60 text-rose-800 px-2.5 py-1 rounded-lg text-[11px]"
                    >
                      <span className="flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>Send to <strong>{s.to}</strong></span>
                      </span>
                      <strong className="font-bold">${Number(s.amount).toFixed(2)}</strong>
                    </div>
                  ))}

                  {member.incoming.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-emerald-50/60 text-emerald-800 px-2.5 py-1 rounded-lg text-[11px]"
                    >
                      <span className="flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>Receive from <strong>{s.from}</strong></span>
                      </span>
                      <strong className="font-bold">${Number(s.amount).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
