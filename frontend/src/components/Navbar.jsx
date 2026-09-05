import React from 'react';
import { CircleDollarSign, RefreshCw, Activity, Users, PlusCircle } from 'lucide-react';

export default function Navbar({ isOnline, isRefreshing, onRefresh, onOpenAddModal, totalExpensesCount }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <CircleDollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">SplitEase</h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Smart Group Expense & Debt Simplifier</p>
            </div>
          </div>

          {/* Right Actions & Status */}
          <div className="flex items-center gap-3">
            {/* Backend Health Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="hidden sm:inline">{isOnline ? 'API Connected' : 'API Offline'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh data from server"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {/* Quick Add Expense Trigger Button (Mobile / Topbar) */}
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold shadow-sm shadow-indigo-500/25 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
