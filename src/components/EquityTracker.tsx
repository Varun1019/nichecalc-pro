'use client';

import React, { useState, useEffect } from 'react';
import { Home, DollarSign, Calendar, TrendingUp, HelpCircle, ShieldAlert, Award, Loader2, Share2, Clipboard, Check } from 'lucide-react';
import AdContainer from '@/components/AdContainer';
import { fetchExchangeRates, CURRENCY_SYMBOLS, ExchangeRates } from '@/lib/currency';

interface EquityTrackerProps {
  onCalculateSuccess?: () => void;
  initialInputs?: any;
}

export default function EquityTracker({ onCalculateSuccess, initialInputs }: EquityTrackerProps) {
  // Currency States
  const [activeCurrency, setActiveCurrency] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);

  // Inputs
  const [homePrice, setHomePrice] = useState<string>('300000');
  const [upfrontFee, setUpfrontFee] = useState<string>('10000');
  const [monthlyRent, setMonthlyRent] = useState<string>('2200');
  const [equityCredit, setEquityCredit] = useState<string>('400');
  const [standardRent, setStandardRent] = useState<string>('1800');
  const [termYears, setTermYears] = useState<string>('3');

  // Outputs
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Share link states
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load Exchange Rates on Mount
  useEffect(() => {
    const getRates = async () => {
      const rates = await fetchExchangeRates();
      setExchangeRates(rates);
    };
    getRates();
  }, []);

  // Hydrate custom inputs from sharing redirect links
  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.homePrice) setHomePrice(initialInputs.homePrice.toString());
      if (initialInputs.upfrontFee) setUpfrontFee(initialInputs.upfrontFee.toString());
      if (initialInputs.monthlyRent) setMonthlyRent(initialInputs.monthlyRent.toString());
      if (initialInputs.equityCredit) setEquityCredit(initialInputs.equityCredit.toString());
      if (initialInputs.standardRent) setStandardRent(initialInputs.standardRent.toString());
      if (initialInputs.termYears) setTermYears(initialInputs.termYears.toString());
      
      // Auto trigger calculate
      setTimeout(() => {
        const calculateBtn = document.getElementById('equity-tracker-submit');
        if (calculateBtn) calculateBtn.click();
      }, 100);
    }
  }, [initialInputs]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShareUrl(null); // Reset share URL when new details are entered

    const price = parseFloat(homePrice) || 0;
    const upfront = parseFloat(upfrontFee) || 0;
    const rent = parseFloat(monthlyRent) || 0;
    const credit = parseFloat(equityCredit) || 0;
    const standard = parseFloat(standardRent) || 0;
    const term = parseFloat(termYears) || 0;

    if (price <= 0 || term <= 0) {
      setError('Home purchase price and lease term must be greater than 0.');
      setLoading(false);
      return;
    }

    if (credit > rent) {
      setError('Monthly equity credit cannot be higher than the monthly rent-to-own payment.');
      setLoading(false);
      return;
    }

    // Calculations (performed in base USD values)
    const months = term * 12;
    const rtoTotalRent = rent * months;
    const rtoTotalPayments = upfront + rtoTotalRent;
    const rtoEquityEarned = upfront + (credit * months);
    const rtoSunkCost = rtoTotalPayments - rtoEquityEarned;
    
    const standardTotalPayments = standard * months;
    const standardSunkCost = standardTotalPayments;
    const totalExtraPremium = rtoTotalPayments - standardTotalPayments;
    const equityRatio = price > 0 ? (rtoEquityEarned / price) * 100 : 0;

    // Year-by-year projections for chart
    const projections = [];
    for (let y = 1; y <= term; y++) {
      const yMonths = y * 12;
      const yEquity = upfront + (credit * yMonths);
      const ySunk = (rent * yMonths) + upfront - yEquity;
      const stdSunk = standard * yMonths;
      projections.push({
        year: `Year ${y}`,
        equity: Math.round(yEquity),
        sunk: Math.round(ySunk),
        stdSunk: Math.round(stdSunk),
      });
    }

    const calcOutputs = {
      price,
      upfront,
      rent,
      credit,
      standard,
      term,
      months,
      rtoTotalPayments,
      rtoEquityEarned,
      rtoSunkCost,
      standardTotalPayments,
      standardSunkCost,
      totalExtraPremium,
      equityRatio: parseFloat(equityRatio.toFixed(1)),
      projections,
    };

    setResults(calcOutputs);

    // Save history log
    try {
      if (typeof window !== 'undefined') {
        const sessionId = localStorage.getItem('nichecalc_session_id') || 'sess_anonymous';
        await fetch('/api/calculations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calcType: 'rent-to-own',
            inputParameters: { homePrice: price, upfrontFee: upfront, monthlyRent: rent, equityCredit: credit, standardRent: standard, termYears: term },
            resultOutput: calcOutputs,
            anonymousSessionId: sessionId,
          }),
        });
        if (onCalculateSuccess) onCalculateSuccess();
      }
    } catch (err) {
      console.warn('Failed to log calculation logs to database.', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    setShareUrl(null);

    const price = parseFloat(homePrice) || 0;
    const upfront = parseFloat(upfrontFee) || 0;
    const rent = parseFloat(monthlyRent) || 0;
    const credit = parseFloat(equityCredit) || 0;
    const standard = parseFloat(standardRent) || 0;
    const term = parseFloat(termYears) || 0;

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calcType: 'rent-to-own',
          inputParameters: { homePrice: price, upfrontFee: upfront, monthlyRent: rent, equityCredit: credit, standardRent: standard, termYears: term },
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        const generatedUrl = window.location.origin + '/quote/' + resData.id;
        setShareUrl(generatedUrl);
        // Copy to clipboard
        navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (e) {
      console.error('Failed to create share link:', e);
    } finally {
      setSharing(false);
    }
  };

  // Helper for currency conversion scaling
  const scaleCurrency = (value: number) => {
    if (!exchangeRates) return value;
    const rate = exchangeRates[activeCurrency] || 1;
    return Math.round(value * rate);
  };

  const formattedCurrency = (value: number) => {
    const symbol = CURRENCY_SYMBOLS[activeCurrency] || '$';
    return symbol + scaleCurrency(value).toLocaleString();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Form Container */}
        <form onSubmit={handleCalculate} className="flex-1 rounded-2xl bg-slate-900/40 p-6 border border-slate-800 shadow-xl backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-sans">
            <Home className="h-5 w-5 text-mint-green" />
            Rent-to-Own Equity Comparison
          </h3>

          <div className="space-y-4">
            {/* Home Price and Term */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="homePrice" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Home Price (USD Base)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 font-mono text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="homePrice"
                    value={homePrice}
                    onChange={(e) => setHomePrice(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-8 pr-4 text-white focus:border-mint-green focus:outline-none text-sm font-number"
                    placeholder="300000"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="termYears" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Term (Years)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="number"
                    id="termYears"
                    value={termYears}
                    onChange={(e) => setTermYears(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-9 pr-4 text-white focus:border-mint-green focus:outline-none text-sm font-number"
                    placeholder="3"
                    min="1"
                    max="10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Upfront Option Fee */}
            <div>
              <label htmlFor="upfrontFee" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Upfront Option Fee (USD Base)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 font-mono text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="upfrontFee"
                  value={upfrontFee}
                  onChange={(e) => setUpfrontFee(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-8 pr-4 text-white focus:border-mint-green focus:outline-none focus:ring-1 focus:ring-mint-green text-base font-number"
                  placeholder="10000"
                />
              </div>
            </div>

            {/* Monthly Rent-to-Own & Equity Credit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="monthlyRent" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Monthly Rent (USD Base)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 font-mono text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="monthlyRent"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-8 pr-4 text-white focus:border-mint-green focus:outline-none text-sm font-number"
                    placeholder="2200"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="equityCredit" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Monthly Credit (USD Base)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 font-mono text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="equityCredit"
                    value={equityCredit}
                    onChange={(e) => setEquityCredit(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-8 pr-4 text-white focus:border-mint-green focus:outline-none text-sm font-number"
                    placeholder="400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Standard Lease equivalent */}
            <div>
              <label htmlFor="standardRent" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Standard Lease Rent equivalent (USD Base)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 font-mono text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="standardRent"
                  value={standardRent}
                  onChange={(e) => setStandardRent(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-8 pr-4 text-white focus:border-mint-green focus:outline-none focus:ring-1 focus:ring-mint-green text-base font-number"
                  placeholder="1800"
                  required
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              id="equity-tracker-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl btn-primary py-3.5 px-4 font-bold cursor-pointer text-base focus:ring-2 focus:ring-mint-green disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Projecting Equity...
                </>
              ) : (
                'Project Rent vs Equity'
              )}
            </button>
          </div>
        </form>

        {/* Mobile Ad Banner */}
        <div className="block lg:hidden w-full">
          <AdContainer type="banner" />
        </div>

        {/* Results Card */}
        <div className="flex-1 flex flex-col justify-between rounded-2xl bg-slate-900/40 p-6 border border-slate-800 shadow-xl backdrop-blur-md">
          {!results ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <Home className="h-12 w-12 text-slate-700 mb-3 animate-pulse" />
              <p className="text-base font-semibold text-slate-300">Awaiting Contract Parameters</p>
              <p className="text-xs text-slate-500 max-w-[240px] mt-1 leading-normal">
                Enter target home value, lease structure, and term to compare rental waste against equity builds.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              {/* Currency Selector + Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Down Payment / Equity Buildup</h4>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-black text-mint-green font-number glow-mint">{formattedCurrency(results.rtoEquityEarned)}</span>
                    <span className="text-[10px] font-semibold text-slate-500">({results.equityRatio}% of Price)</span>
                  </div>
                </div>

                {/* Live Currency Selector */}
                <div>
                  <label htmlFor="currency-select-equity" className="sr-only">Select Currency</label>
                  <select
                    id="currency-select-equity"
                    value={activeCurrency}
                    onChange={(e) => setActiveCurrency(e.target.value)}
                    className="rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-2.5 text-xs text-slate-300 font-semibold cursor-pointer focus:border-mint-green focus:outline-none"
                  >
                    {exchangeRates ? (
                      Object.keys(exchangeRates).map((curr) => (
                        <option key={curr} value={curr}>
                          {curr} ({CURRENCY_SYMBOLS[curr]})
                        </option>
                      ))
                    ) : (
                      <option value="USD">USD ($)</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Share Config URL Module */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Share Contract Projections</span>
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={sharing}
                    className="flex items-center gap-1.5 text-xs font-bold text-mint-green hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {sharing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Share2 className="h-3.5 w-3.5" />
                    )}
                    {copied ? 'Copied Link!' : 'Get Shareable Link'}
                  </button>
                </div>
                {shareUrl && (
                  <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="bg-transparent border-none text-[10px] text-slate-400 font-mono w-full focus:outline-none focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 3000);
                      }}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* SVG progression chart */}
              <div className="flex flex-col space-y-2 py-2 border-y border-slate-800/60">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Equity Growth Progression</span>
                <div className="h-36 w-full pt-2">
                  <svg className="w-full h-full" viewBox="0 0 320 120">
                    <line x1="30" y1="10" x2="310" y2="10" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
                    <line x1="30" y1="50" x2="310" y2="50" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
                    <line x1="30" y1="90" x2="310" y2="90" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
                    
                    {results.projections.map((proj: any, idx: number) => {
                      const count = results.projections.length;
                      const spacing = 280 / count;
                      const x = 35 + (idx * spacing);
                      const maxEquity = results.rtoEquityEarned;
                      const height = maxEquity > 0 ? (proj.equity / maxEquity) * 80 : 0;
                      const y = 90 - height;
                      
                      return (
                        <g key={idx}>
                          <rect
                            x={x}
                            y={y}
                            width={spacing * 0.4}
                            height={height}
                            fill="#34d399"
                            rx="3"
                            className="transition-all duration-300 hover:fill-emerald-400"
                          />
                          <rect
                            x={x + (spacing * 0.45)}
                            y={88}
                            width={spacing * 0.4}
                            height={2}
                            fill="#ef4444"
                            rx="1"
                          />
                          <text x={x + (spacing * 0.4)} y="105" fill="#9ca3af" fontSize="8" textAnchor="middle">
                            {proj.year}
                          </text>
                          <text x={x + (spacing * 0.2)} y={y - 4} fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle" className="font-number">
                            {CURRENCY_SYMBOLS[activeCurrency] || '$'}{Math.round(scaleCurrency(proj.equity) / 1000)}k
                          </text>
                        </g>
                      );
                    })}
                    <line x1="30" y1="90" x2="310" y2="90" stroke="#374151" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="flex justify-center gap-4 text-[9px] text-slate-500 pt-1 font-semibold uppercase">
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2 w-2 rounded bg-mint-green" />
                    <span>Rent-to-Own Equity</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2 bg-rose-500" />
                    <span>Standard Rent Equity ($0)</span>
                  </div>
                </div>
              </div>

              {/* Financial comparison table */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-3 font-bold text-slate-500 py-1 border-b border-slate-800/40 uppercase tracking-wider text-[10px]">
                  <span>Metric</span>
                  <span className="text-right">Rent-to-Own</span>
                  <span className="text-right">Std Lease</span>
                </div>
                <div className="grid grid-cols-3 py-1 border-b border-slate-850">
                  <span className="text-slate-400">Total Paid</span>
                  <span className="text-right text-white font-bold font-number">{formattedCurrency(results.rtoTotalPayments)}</span>
                  <span className="text-right text-white font-bold font-number">{formattedCurrency(results.standardTotalPayments)}</span>
                </div>
                <div className="grid grid-cols-3 py-1 border-b border-slate-850">
                  <span className="text-slate-400">Sunk Rent</span>
                  <span className="text-right text-rose-400 font-bold font-number">{formattedCurrency(results.rtoSunkCost)}</span>
                  <span className="text-right text-rose-400 font-bold font-number">{formattedCurrency(results.standardSunkCost)}</span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-400">Equity Built</span>
                  <span className="text-right text-mint-green font-black font-number">{formattedCurrency(results.rtoEquityEarned)}</span>
                  <span className="text-right text-slate-600 font-number">$0</span>
                </div>
              </div>

              {/* Summary note */}
              <div className="rounded-xl bg-slate-950/60 p-3 text-[10px] text-slate-400 border border-slate-850 leading-relaxed flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-mint-green flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold">Premium Analysis:</span> Rent-to-own costs <span className="font-number font-bold text-white">{formattedCurrency(results.totalExtraPremium)}</span> more than standard renting over {results.term} years, but locks in the purchase rate and saves a <span className="font-number font-bold text-white">{formattedCurrency(results.rtoEquityEarned)}</span> down-payment asset.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
