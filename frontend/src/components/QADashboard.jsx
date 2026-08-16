import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Terminal, 
  Code2, 
  FileText, 
  Zap, 
  CheckCheck,
  Server,
  Database,
  Search,
  AlertOctagon
} from 'lucide-react';
import apiService from '../services/api';

const TEST_CATEGORIES = [
  {
    name: 'Health & System',
    tests: [
      { id: 'TC-01', name: 'Health Endpoint Availability', endpoint: 'GET /api/health', expected: '200 OK + Status Healthy' },
      { id: 'TC-02', name: 'Empty Database Handling', endpoint: 'GET /api/employees', expected: '200 OK + Empty Array' },
    ]
  },
  {
    name: 'CRUD Core Operations',
    tests: [
      { id: 'TC-03', name: 'Create Valid Employee', endpoint: 'POST /api/employees', expected: '201 Created + Employee Object' },
      { id: 'TC-04', name: 'Get Employee by ID', endpoint: 'GET /api/employees/:id', expected: '200 OK + Record' },
      { id: 'TC-05', name: 'Get Non-existent Employee', endpoint: 'GET /api/employees/9999', expected: '404 Not Found' },
      { id: 'TC-06', name: 'Update Employee Fields', endpoint: 'PUT /api/employees/:id', expected: '200 OK + Updated Record' },
      { id: 'TC-07', name: 'Update Non-existent ID', endpoint: 'PUT /api/employees/9999', expected: '404 Not Found' },
      { id: 'TC-08', name: 'Delete Employee', endpoint: 'DELETE /api/employees/:id', expected: '200 OK + Confirmation' },
      { id: 'TC-09', name: 'Delete Non-existent ID', endpoint: 'DELETE /api/employees/9999', expected: '404 Not Found' },
    ]
  },
  {
    name: 'Search & Filtering',
    tests: [
      { id: 'TC-10', name: 'Search by Name Substring', endpoint: 'GET /api/employees?search=Rahul', expected: '200 OK + Matching Subset' },
      { id: 'TC-11', name: 'Search by Email Substring', endpoint: 'GET /api/employees?search=@example', expected: '200 OK + Filtered List' },
      { id: 'TC-12', name: 'Filter by Department', endpoint: 'GET /api/employees?department=IT', expected: '200 OK + IT Only Records' },
    ]
  },
  {
    name: 'Validation & Negative Boundary',
    tests: [
      { id: 'TC-13', name: 'Missing or Empty Name', endpoint: 'POST /api/employees', expected: '400 Bad Request' },
      { id: 'TC-14', name: 'Whitespace-Only Name', endpoint: 'POST /api/employees', expected: '400 Bad Request' },
      { id: 'TC-15', name: 'Invalid Email RFC Regex', endpoint: 'POST /api/employees', expected: '400 Bad Request' },
      { id: 'TC-16', name: 'Duplicate Email Conflict', endpoint: 'POST /api/employees', expected: '409 Conflict' },
      { id: 'TC-17', name: 'Cross-Employee Email Conflict', endpoint: 'PUT /api/employees/:id', expected: '409 Conflict' },
      { id: 'TC-18', name: 'Unapproved Department', endpoint: 'POST /api/employees', expected: '400 Bad Request' },
      { id: 'TC-19', name: 'Negative Salary Input', endpoint: 'POST /api/employees', expected: '400 Bad Request' },
      { id: 'TC-20', name: 'Non-Numeric Salary String', endpoint: 'POST /api/employees', expected: '400 Bad Request' },
      { id: 'TC-21', name: 'Malformed JSON Payload', endpoint: 'POST /api/employees', expected: '400 Bad Request' },
    ]
  }
];

export default function QADashboard() {
  const [liveTestResult, setLiveTestResult] = useState(null);
  const [isRunningLiveTest, setIsRunningLiveTest] = useState(false);

  const runLiveHealthProbe = async () => {
    setIsRunningLiveTest(true);
    const start = performance.now();
    try {
      const data = await apiService.checkHealth();
      const duration = Math.round(performance.now() - start);
      setLiveTestResult({
        status: 'PASSED',
        statusCode: 200,
        latency: `${duration}ms`,
        payload: data,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      setLiveTestResult({
        status: 'FAILED',
        statusCode: err.status || 500,
        latency: `${duration}ms`,
        error: err.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsRunningLiveTest(false);
    }
  };

  const totalSpecs = TEST_CATEGORIES.reduce((acc, c) => acc + c.tests.length, 0);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 mb-6 shadow-xl border border-slate-800 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">
                QA Test Matrix & API Verification Suite
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                pytest Automated
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive test suite located in <code className="text-indigo-300 font-mono">backend/tests/</code> (Total: {totalSpecs} Automated Test Cases)
            </p>
          </div>
        </div>

        {/* Live Probe Trigger */}
        <div className="flex items-center space-x-3">
          <button
            onClick={runLiveHealthProbe}
            disabled={isRunningLiveTest}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isRunningLiveTest ? 'Probing...' : 'Run Live Health Probe'}</span>
          </button>
        </div>
      </div>

      {/* Live Probe Output Box (if triggered) */}
      {liveTestResult && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
            <span className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>LIVE PROBE EXECUTION RESULTS</span>
            </span>
            <span>{liveTestResult.timestamp}</span>
          </div>
          <div className="mt-2.5 flex items-center space-x-4">
            <span className={`px-2 py-0.5 rounded font-bold ${
              liveTestResult.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {liveTestResult.status}
            </span>
            <span className="text-slate-300">Status: {liveTestResult.statusCode}</span>
            <span className="text-slate-400">Latency: {liveTestResult.latency}</span>
          </div>
          <pre className="mt-2 text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded border border-slate-800/80">
            {JSON.stringify(liveTestResult.payload || { error: liveTestResult.error }, null, 2)}
          </pre>
        </div>
      )}

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Total Automated Tests</span>
          <span className="text-xl font-bold text-white mt-1 block">{totalSpecs} Tests</span>
          <span className="text-xs text-emerald-400">100% Target Pass Rate</span>
        </div>
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Test Framework</span>
          <span className="text-xl font-bold text-white mt-1 block">pytest + client</span>
          <span className="text-xs text-indigo-300">In-Memory SQLite</span>
        </div>
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Coverage Areas</span>
          <span className="text-xl font-bold text-white mt-1 block">4 Categories</span>
          <span className="text-xs text-slate-400">Health, CRUD, Search, Negatives</span>
        </div>
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">CI/CD Pipeline</span>
          <span className="text-xl font-bold text-white mt-1 block">GitHub Actions</span>
          <span className="text-xs text-emerald-400">Automated on Push / PR</span>
        </div>
      </div>

      {/* Test Matrix Breakdown by Category */}
      <div className="space-y-4">
        {TEST_CATEGORIES.map((cat, idx) => (
          <div key={idx} className="bg-slate-950/40 rounded-xl border border-slate-800/80 p-4">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>{cat.name} ({cat.tests.length} Specs)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {cat.tests.map((test) => (
                <div 
                  key={test.id}
                  className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between space-x-2"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-mono text-slate-500 shrink-0">{test.id}</span>
                    <span className="font-semibold text-slate-200 truncate">{test.name}</span>
                  </div>
                  <span className="font-mono text-xs text-indigo-300 bg-slate-800/80 px-2 py-0.5 rounded shrink-0">
                    {test.endpoint}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Execution Instructions */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-1.5">
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span>Run automated suite locally:</span>
          <code className="text-indigo-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            pytest -v
          </code>
        </div>
        <span className="text-slate-500">
          Refer to <code className="text-slate-400">TESTING.md</code> for full QA report & test logs
        </span>
      </div>

    </div>
  );
}
