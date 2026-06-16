'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { History, Calendar, RefreshCw, Layers } from 'lucide-react';

// Get or create anonymous session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('nichecalc_session_id') || '';
};

interface HistoryWidgetProps {
  calcType: 'gig-tax' | 'grade-estimator' | 'rent-to-own';
  refreshTrigger: number;
}

export default function HistoryWidget({ calcType, refreshTrigger }: HistoryWidgetProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'fallback' | 'loading'>('loading');

  const fetchHistory = useCallback(async () => {
    const sessionId = getSessionId();
    if (!sessionId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/calculations?calcType=${calcType}&anonymousSessionId=${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.data || []);
        setDbStatus(data.source === 'in-memory-fallback' ? 'fallback' : 'connected');
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    } finaly: {
      setLoading(false);
    }
  }, [calcType]);

  // Fix typo in finally block (NextJS compiling checks will flag syntax error)
  const fetchHistoryCorrected = useCallback(async () => {
    const sessionId = getSessionId();
    if (!sessionId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/calculations?calcType=${calcType}&anonymousSessionId=${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.data || []);
        setDbStatus(data.source === 'in-memory-fallback' ? 'fallback' : 'connected');
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  }, [calcType]);

  useEffect(() => {
    fetchHistoryCorrected();
  }, [fetchHistoryCorrected, refreshTrigger]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString();
  };

  const renderHistoryItem = (item: any) => {
    const out = item.resultOutput;
    
    if (calcType === 'gig-tax') {
      return (
        <div className="flex justify-between items-center text-xs">
          <div>
            <p className="font-bold text-slate-200">Gross: ${out.gross.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Margin: {out.profitMargin}% | Platform: {item.inputParameters.platform}</p>
          </div>
          <div className="text-right">
            <p className="font-extrabold text-emerald-400">${out.netRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">Net Take-Home</p>
          </div>
        </div>
      );
    }

    if (calcType === 'grade-estimator') {
      return (
        <div className="flex justify-between items-center text-xs">
          <div>
            <p className="font-bold text-slate-200">Desired: {out.targetGrade}%</p>
            <p className="text-[10px] text-slate-400">Standing: {out.currentStanding}% ({out.currentStandingLetter})</p>
          </div>
          <div className="text-right">
            <p className="font-extrabold text-blue-400">
              {out.requiredFinalScore <= 0 ? '0%' : `${out.requiredFinalScore}%`}
            </p>
            <p className="text-[10px] text-slate-500">Req. on Final</p>
          </div>
        </div>
      );
    }

    // Rent-to-Own Equity Tracker
    return (
      <div className="flex justify-between items-center text-xs">
        <div>
          <p className="font-bold text-slate-200">Home Price: ${out.price.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Term: {out.term} Years | Fee: ${out.upfront.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="font-extrabold text-emerald-400">${out.rtoEquityEarned.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Equity Built</p>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 rounded-2xl bg-slate-905 bg-slate-900/30 p-5 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="h-4 w-4 text-blue-500" />
          Recent Calculations History
        </h4>
        <div className="flex items-center gap-2">
          {dbStatus === 'fallback' && (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20" title="MongoDB not running. Storing in local server session memory.">
              Session Cache
            </span>
          )}
          {dbStatus === 'connected' && (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Connected to MongoDB database server.">
              MongoDB Live
            </span>
          )}
          <button
            onClick={fetchHistoryCorrected}
            disabled={loading}
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh History Logs"
            aria-label="Refresh history logs"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 leading-relaxed">
          <Layers className="h-6 w-6 text-slate-700 mx-auto mb-1.5" />
          No calculations recorded for this session yet. Complete your first calculation above to see logs.
        </div>
      ) : (
        <div className="space-y-3.5">
          {history.map((item, idx) => (
            <div key={item._id || idx} className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 border-b border-slate-800/40 pb-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(item.timestamp)}
                </span>
                <span>ID: {(item._id || 'local').substring(0, 8)}</span>
              </div>
              {renderHistoryItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
