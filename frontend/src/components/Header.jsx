import React from 'react';
import { Users, Plus, Activity, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Header({ 
  onAddClick, 
  healthStatus, 
  onRefreshHealth, 
  isHealthChecking,
  showQAPanel,
  setShowQAPanel 
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm shadow-sky-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Employee Management System
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Production-Ready Flask + React Enterprise Architecture
              </p>
            </div>
          </div>

          {/* Right Actions & Health Monitor */}
          <div className="flex items-center space-x-3">
            
            {/* QA Testing View Toggle */}
            <button
              onClick={() => setShowQAPanel(!showQAPanel)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                showQAPanel
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Toggle QA & API Test Matrix"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">{showQAPanel ? 'Hide QA Suite' : 'QA & Test Matrix'}</span>
            </button>

            {/* Live Backend Health Badge */}
            <div 
              onClick={onRefreshHealth}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              title="Click to check backend status"
            >
              <span className="relative flex h-2.5 w-2.5">
                {healthStatus === 'healthy' ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                )}
              </span>
              <span className="text-xs font-medium text-slate-700">
                {isHealthChecking ? 'Checking...' : healthStatus === 'healthy' ? 'API Online' : 'API Offline'}
              </span>
              <RefreshCw className={`w-3 h-3 text-slate-400 ${isHealthChecking ? 'animate-spin' : ''}`} />
            </div>

            {/* Add Employee CTA */}
            <button
              id="btn-add-employee-header"
              onClick={onAddClick}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-semibold rounded-lg shadow-xs transition duration-150 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
