import React, { useState } from 'react';
import { analyzeRisk } from '../services/geminiService';
import { RiskAssessment, RiskLevel } from '../types';
import { Search, AlertTriangle, CheckCircle, BrainCircuit, Loader2 } from 'lucide-react';

export const RiskScanner: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskAssessment | null>(null);

  const handleScan = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const assessment = await analyzeRisk(query);
    setResult(assessment);
    setLoading(false);
  };

  return (
    <div className="bg-brand-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      <div className="flex items-center space-x-2 mb-4">
        <BrainCircuit className="text-brand-accent w-6 h-6" />
        <h2 className="text-lg font-bold text-white">AI Hazard Scout</h2>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a Place Name (e.g. 'Mysore') or Describe a Situation"
            className="w-full bg-brand-900 border border-slate-600 rounded-lg py-3 pl-4 pr-12 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent placeholder-slate-500"
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="absolute right-2 top-2 p-1.5 bg-brand-accent hover:bg-sky-400 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {result && (
          <div className={`rounded-lg p-4 border animate-fadeIn ${result.level === RiskLevel.HIGH || result.level === RiskLevel.CRITICAL
              ? 'bg-red-900/20 border-red-500/50'
              : result.level === RiskLevel.MEDIUM
                ? 'bg-amber-900/20 border-amber-500/50'
                : 'bg-emerald-900/20 border-emerald-500/50'
            }`}>
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${result.level === RiskLevel.HIGH || result.level === RiskLevel.CRITICAL ? 'text-red-400 bg-red-900/50' :
                  result.level === RiskLevel.MEDIUM ? 'text-amber-400 bg-amber-900/50' : 'text-emerald-400 bg-emerald-900/50'
                }`}>
                Risk Level: {result.level}
              </span>
              <span className="text-2xl font-bold font-mono">{result.score}/100</span>
            </div>

            <p className="text-sm text-slate-300 mb-3">{result.summary}</p>

            <div>
              <h4 className="text-xs uppercase text-slate-500 font-semibold mb-1">Safety Precautions</h4>
              <ul className="text-xs space-y-1">
                {result.precautions.map((p, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-slate-400 shrink-0" />
                    <span className="text-slate-300">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};