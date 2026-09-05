import React, { useState, useEffect } from 'react';
import { Plus, Check, UserPlus, Users, DollarSign, Tag, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const PRESET_TAGS = [
  { label: '🍕 Dinner', text: 'Dinner' },
  { label: '🛒 Groceries', text: 'Groceries' },
  { label: '🚕 Ride / Uber', text: 'Uber Ride' },
  { label: '☕ Drinks', text: 'Drinks & Coffee' },
  { label: '🏠 Rent & Bills', text: 'Rent & Utilities' },
  { label: '✈️ Travel', text: 'Travel Booking' },
  { label: '🍿 Fun', text: 'Movie & Entertainment' },
];

export default function ExpenseForm({ knownPeople = [], onAddExpense, isLoading }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [customPaidBy, setCustomPaidBy] = useState('');
  const [isAddingNewPayer, setIsAddingNewPayer] = useState(false);

  // Split participants pool: known people + any custom participants added in this session
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [newPersonInput, setNewPersonInput] = useState('');
  const [formError, setFormError] = useState('');

  // Sync known people into participants list
  useEffect(() => {
    setAllParticipants((prev) => {
      const merged = Array.from(new Set([...knownPeople, ...prev]));
      return merged.sort();
    });

    // Default select all if no selection exists and people are available
    if (selectedParticipants.length === 0 && knownPeople.length > 0) {
      setSelectedParticipants(knownPeople);
    }
  }, [knownPeople]);

  // Handle adding a new person to the group directly from the form
  const handleAddNewPerson = (e) => {
    if (e) e.preventDefault();
    const trimmed = newPersonInput.trim();
    if (!trimmed) return;

    if (!allParticipants.includes(trimmed)) {
      setAllParticipants((prev) => [...prev, trimmed].sort());
    }
    if (!selectedParticipants.includes(trimmed)) {
      setSelectedParticipants((prev) => [...prev, trimmed]);
    }
    if (!paidBy) {
      setPaidBy(trimmed);
    }
    setNewPersonInput('');
  };

  const toggleParticipant = (person) => {
    setSelectedParticipants((prev) =>
      prev.includes(person) ? prev.filter((p) => p !== person) : [...prev, person]
    );
  };

  const selectAllParticipants = () => {
    setSelectedParticipants([...allParticipants]);
  };

  const clearParticipants = () => {
    setSelectedParticipants([]);
  };

  const actualPayer = isAddingNewPayer ? customPaidBy.trim() : paidBy;

  // Real-time split calculation
  const parsedAmount = parseFloat(amount) || 0;
  const splitCount = selectedParticipants.length;
  const perPersonShare = splitCount > 0 ? (parsedAmount / splitCount).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const descTrimmed = description.trim();
    const payerTrimmed = isAddingNewPayer ? customPaidBy.trim() : paidBy.trim();
    const numAmount = parseFloat(amount);

    if (!descTrimmed) {
      setFormError('Please enter a description for this expense.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }
    if (!payerTrimmed) {
      setFormError('Please select or specify who paid for this expense.');
      return;
    }
    if (selectedParticipants.length === 0) {
      setFormError('Please select at least one person to split this expense with.');
      return;
    }

    try {
      await onAddExpense({
        description: descTrimmed,
        amount: numAmount,
        paidBy: payerTrimmed,
        splitBetween: selectedParticipants,
      });

      // Reset form on success
      setDescription('');
      setAmount('');
      if (isAddingNewPayer) {
        setIsAddingNewPayer(false);
        setCustomPaidBy('');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to record expense.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Add New Expense</h2>
            <p className="text-xs text-slate-500">Record a payment and split it equally</p>
          </div>
        </div>
      </div>

      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Preset Quick Tags */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Quick Category Presets</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => setDescription(tag.text)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200/60 transition-colors"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description & Amount Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Saturday Italian Dinner"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount ($) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                required
              />
            </div>
          </div>
        </div>

        {/* Paid By Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Who Paid? <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsAddingNewPayer(!isAddingNewPayer)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isAddingNewPayer ? 'Pick from existing members' : '+ New Payer'}
            </button>
          </div>

          {isAddingNewPayer ? (
            <input
              type="text"
              value={customPaidBy}
              onChange={(e) => setCustomPaidBy(e.target.value)}
              placeholder="Type person's name..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              autoFocus
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {allParticipants.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No members yet. Add participants below or click "+ New Payer".</p>
              ) : (
                allParticipants.map((person) => {
                  const isSelected = paidBy === person;
                  return (
                    <button
                      key={person}
                      type="button"
                      onClick={() => setPaidBy(person)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {person}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Split Between Multi-Select */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Split Between <span className="text-rose-500">*</span> ({selectedParticipants.length} selected)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllParticipants}
                className="text-[11px] font-medium text-slate-500 hover:text-indigo-600"
              >
                Select All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={clearParticipants}
                className="text-[11px] font-medium text-slate-500 hover:text-rose-600"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Participant Chips */}
          <div className="flex flex-wrap gap-2 mb-2.5 min-h-[38px] p-2 rounded-xl bg-slate-50 border border-slate-200/70">
            {allParticipants.length === 0 ? (
              <span className="text-xs text-slate-400 self-center">Add group members below to split with</span>
            ) : (
              allParticipants.map((person) => {
                const isChecked = selectedParticipants.includes(person);
                return (
                  <button
                    key={person}
                    type="button"
                    onClick={() => toggleParticipant(person)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                      isChecked
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                      isChecked ? 'bg-white/20 text-white' : 'border border-slate-300'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    {person}
                  </button>
                );
              })
            )}
          </div>

          {/* Inline Add Person to Group */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPersonInput}
              onChange={(e) => setNewPersonInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNewPerson();
                }
              }}
              placeholder="Add new person (e.g. Charlie)..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
            <button
              type="button"
              onClick={handleAddNewPerson}
              disabled={!newPersonInput.trim()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 border border-slate-200"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Live Calculation Preview Banner */}
        {parsedAmount > 0 && splitCount > 0 && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong className="font-semibold">{actualPayer || 'Someone'}</strong> paid <strong>${parsedAmount.toFixed(2)}</strong> for {splitCount} people
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-indigo-700 text-sm">${perPersonShare}</span>
              <span className="text-indigo-500 text-[10px] block">/ person</span>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Expense...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Save & Split Expense</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
