import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Trash2,
  Utensils,
  ShoppingCart,
  Car,
  Coffee,
  Home,
  Plane,
  Film,
  Calendar,
  Users,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

function getCategoryIcon(desc = '') {
  const d = desc.toLowerCase();
  if (d.includes('dinner') || d.includes('food') || d.includes('lunch') || d.includes('pizza') || d.includes('eat') || d.includes('burger')) {
    return <Utensils className="w-4 h-4 text-orange-500" />;
  }
  if (d.includes('grocer') || d.includes('market') || d.includes('supermarket')) {
    return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
  }
  if (d.includes('uber') || d.includes('taxi') || d.includes('ride') || d.includes('gas') || d.includes('car')) {
    return <Car className="w-4 h-4 text-blue-500" />;
  }
  if (d.includes('coffee') || d.includes('drink') || d.includes('bar') || d.includes('beer')) {
    return <Coffee className="w-4 h-4 text-amber-500" />;
  }
  if (d.includes('rent') || d.includes('utility') || d.includes('wifi') || d.includes('bill')) {
    return <Home className="w-4 h-4 text-indigo-500" />;
  }
  if (d.includes('travel') || d.includes('flight') || d.includes('hotel') || d.includes('airbnb')) {
    return <Plane className="w-4 h-4 text-sky-500" />;
  }
  if (d.includes('movie') || d.includes('game') || d.includes('show') || d.includes('concert')) {
    return <Film className="w-4 h-4 text-purple-500" />;
  }
  return <Receipt className="w-4 h-4 text-indigo-500" />;
}

function formatDate(isoString) {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

export default function ExpenseList({
  expenses = [],
  knownPeople = [],
  onDeleteExpense,
  deletingId,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [personFilter, setPersonFilter] = useState('ALL');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Filter expenses based on search and member selection
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.paidBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(e.splitBetween) &&
        e.splitBetween.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesPerson =
      personFilter === 'ALL' ||
      e.paidBy === personFilter ||
      (Array.isArray(e.splitBetween) && e.splitBetween.includes(personFilter));

    return matchesSearch && matchesPerson;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Expenses History</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredExpenses.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">All recorded transactions and split details</p>
        </div>

        {/* Search and Member Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>

          {knownPeople.length > 0 && (
            <select
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none text-slate-700"
            >
              <option value="ALL">All Members</option>
              {knownPeople.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Expenses Content */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            {expenses.length === 0 ? 'No expenses recorded yet' : 'No matching expenses found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {expenses.length === 0
              ? 'Add your first group expense using the form to start tracking balances and settlements.'
              : 'Try clearing your search query or person filter to view all expenses.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const splitCount = expense.splitBetween?.length || 1;
            const perPerson = (expense.amount / splitCount).toFixed(2);
            const isDeleting = deletingId === expense.id;
            const isConfirming = confirmDeleteId === expense.id;

            return (
              <div
                key={expense.id}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60 group-hover:bg-white group-hover:shadow-2xs transition-all">
                    {getCategoryIcon(expense.description)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-slate-900 truncate">
                        {expense.description}
                      </h4>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Paid by {expense.paidBy}
                      </span>
                    </div>

                    {/* Split Details & Date */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(expense.createdAt)}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span title={expense.splitBetween?.join(', ')}>
                          Split with {splitCount} {splitCount === 1 ? 'person' : 'people'} ({expense.splitBetween?.join(', ')})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-13 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <div className="text-base font-bold text-slate-900">
                      ${Number(expense.amount).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ${perPerson} / person
                    </div>
                  </div>

                  {/* Delete Button / Confirm */}
                  <div className="flex items-center">
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-lg border border-rose-200">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteId(null);
                            onDeleteExpense(expense.id);
                          }}
                          disabled={isDeleting}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold rounded-md transition-colors"
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-md transition-colors border border-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(expense.id)}
                        disabled={isDeleting}
                        title="Delete expense"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
