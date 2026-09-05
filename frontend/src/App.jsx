import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import BalancesView from './components/BalancesView';
import {
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({ net: {}, pairwise: [] });
  const [people, setPeople] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all state from API
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      // Check health
      await api.getHealth();
      setIsOnline(true);

      const [expensesData, balancesData, peopleData] = await Promise.all([
        api.getExpenses(),
        api.getBalances(),
        api.getPeople(),
      ]);

      setExpenses(expensesData || []);
      setBalances(balancesData || { net: {}, pairwise: [] });
      setPeople(peopleData || []);
    } catch (err) {
      console.error('Failed to sync with backend:', err);
      setIsOnline(false);
      if (!isSilent) {
        addToast(
          'Could not connect to backend server at http://localhost:3001. Please make sure it is running.',
          'error'
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle adding an expense
  const handleAddExpense = async (payload) => {
    setIsSubmitting(true);
    try {
      const created = await api.createExpense(payload);
      addToast(`Added "${created.description}" ($${Number(created.amount).toFixed(2)}) successfully!`);
      await fetchData(true);
    } catch (err) {
      console.error('Add expense error:', err);
      addToast(err.message || 'Failed to add expense', 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an expense
  const handleDeleteExpense = async (id) => {
    setDeletingId(id);
    try {
      await api.deleteExpense(id);
      addToast('Expense removed successfully', 'info');
      await fetchData(true);
    } catch (err) {
      console.error('Delete expense error:', err);
      addToast(err.message || 'Failed to delete expense', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start justify-between gap-2.5 transition-all transform animate-in slide-in-from-bottom-2 ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : toast.type === 'info'
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-start gap-2 text-xs sm:text-sm font-medium">
              {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-75 rounded transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <Navbar
        isOnline={isOnline}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchData()}
        totalExpensesCount={expenses.length}
      />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Backend server is currently offline or unreachable on <code>http://localhost:3001</code>. Start the backend with <code>npm start</code> in <code>backend/</code>.
            </span>
          </div>
          <button
            onClick={() => fetchData()}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold ml-4 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Metric Cards Overview */}
        <StatsCards expenses={expenses} balances={balances} people={people} />

        {/* 2-Column Responsive Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Column (Expense Form + History) */}
          <div className="lg:col-span-7 space-y-6">
            <ExpenseForm
              knownPeople={people}
              onAddExpense={handleAddExpense}
              isLoading={isSubmitting}
            />

            <ExpenseList
              expenses={expenses}
              knownPeople={people}
              onDeleteExpense={handleDeleteExpense}
              deletingId={deletingId}
            />
          </div>

          {/* Right / Sidebar Column (Balances & Debt Settlements) */}
          <div className="lg:col-span-5 space-y-6 sticky top-20">
            <BalancesView
              balances={balances}
              expenses={expenses}
              people={people}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>SplitEase Expense Splitter • Powered by Express & React</p>
      </footer>
    </div>
  );
}
