'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, DollarSign, Percent, Briefcase, HelpCircle, Loader2, Share2, Clipboard, Check } from 'lucide-react';
import AdContainer from '@/components/AdContainer';
import { fetchExchangeRates, CURRENCY_SYMBOLS, ExchangeRates } from '@/lib/currency';

interface GigTaxCalculatorProps {
  onCalculateSuccess?: () => void;
  initialInputs?: any;
}

const PLATFORMS = [
  { id: 'upwork', name: 'Upwork (10%)', commission: 10 },
  { id: 'fiverr', name: 'Fiverr (20%)', commission: 20 },
  { id: 'uber', name: 'Uber (25%)', commission: 25 },
  { id: 'custom', name: 'Custom Platform / Direct', commission: 0 },
];

export default function GigTaxCalculator({ onCalculateSuccess, initialInputs }: GigTaxCalculatorProps) {
  // Currency States
  const [activeCurrency, setActiveCurrency] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);

  // Inputs
  const [period, setPeriod] = useState<'quarterly' | 'annual'>('quarterly');
  const [grossIncome, setGrossIncome] = useState<string>('15000');
  const [platform, setPlatform] = useState<string>('upwork');
  const [commissionRate, setCommissionRate] = useState<string>('10');
  const [expenses, setExpenses] = useState<string>('1500');
  const [stateTaxRate, setStateTaxRate] = useState<string>('5');
  const [fedTaxRate, setFedTaxRate] = useState<string>('12');

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
      if (initialInputs.period) setPeriod(initialInputs.period);
      if (initialInputs.grossIncome) setGrossIncome(initialInputs.grossIncome.toString());
      if (initialInputs.platform) setPlatform(initialInputs.platform);
      if (initialInputs.commissionRate) setCommissionRate(initialInputs.commissionRate.toString());
      if (initialInputs.expenses) setExpenses(initialInputs.expenses.toString());
      if (initialInputs.stateTaxRate) setStateTaxRate(initialInputs.stateTaxRate.toString());
      if (initialInputs.fedTaxRate) setFedTaxRate(initialInputs.fedTaxRate.toString());
      
      // Auto trigger calculate
      setTimeout(() => {
        const calculateBtn = document.getElementById('gig-tax-submit');
        if (calculateBtn) calculateBtn.click();
      }, 100);
    }
  }, [initialInputs]);

  // Synchronize commission rate when platform changes
  useEffect(() => {
    const selected = PLATFORMS.find((p) => p.id === platform);
    if (selected && platform !== 'custom') {
      setCommissionRate(selected.commission.toString());
    }
  }, [platform]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShareUrl(null); // Reset share URL when new numbers are computed

    const gross = parseFloat(grossIncome) || 0;
    const comm = parseFloat(commissionRate) || 0;
    const exp = parseFloat(expenses) || 0;
    const state = parseFloat(stateTaxRate) || 0;
    const fed = parseFloat(fedTaxRate) || 0;

    if (gross <= 0) {
      setError('Gross income must be greater than 0.');
      setLoading(false);
      return;
    }

    // Calculations (performed in USD base)
    const platformDeductions = gross * (comm / 100);
    const netEarningsSE = Math.max(0, gross - platformDeductions - exp);
    const fedSETax = netEarningsSE * 0.9235 * 0.153;
    const fedIncomeTax = netEarningsSE * (fed / 100);
    const stateIncomeTax = netEarningsSE * (state / 100);
    const totalTaxes = fedSETax + fedIncomeTax + stateIncomeTax;
    const netRevenue = gross - platformDeductions - exp - totalTaxes;
    const profitMargin = gross > 0 ? (netRevenue / gross) * 100 : 0;

    const calcOutputs = {
      gross,
      platformDeductions,
      expenses: exp,
      netEarningsSE,
      fedSETax: Math.round(fedSETax),
      fedIncomeTax: Math.round(fedIncomeTax),
      stateIncomeTax: Math.round(stateIncomeTax),
      totalTaxes: Math.round(totalTaxes),
      netRevenue: Math.round(netRevenue),
      profitMargin: parseFloat(profitMargin.toFixed(1)),
      period,
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
            calcType: 'gig-tax',
            inputParameters: { period, grossIncome: gross, platform, commissionRate: comm, expenses: exp, stateTaxRate: state, fedTaxRate: fed },
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

    const gross = parseFloat(grossIncome) || 0;
    const comm = parseFloat(commissionRate) || 0;
    const exp = parseFloat(expenses) || 0;
    const state = parseFloat(stateTaxRate) || 0;
    const fed = parseFloat(fedTaxRate) || 0;

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calcType: 'gig-tax',
          inputParameters: { period, grossIncome: gross, platform, commissionRate: comm, expenses: exp, stateTaxRate: state, fedTaxRate: fed },
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

  // Helper for applying currency exchange scaling to base USD results
  const scaleCurrency = (value: number) => {
    if (!exchangeRates) return value;
    const rate = exchangeRates[activeCurrency] || 1;
    return Math.round(value * rate);
  };

  const formattedCurrency = (value: number) => {
    const symbol = CURRENCY_SYMBOLS[activeCurrency] || '$';
    return symbol + scaleCurrency(value).toLocaleString();
  };

  // SVG Donut Chart variables
  const getChartData = () => {
    if (!results) return null;
    const total = results.gross;
    const net = Math.max(0, results.netRevenue);
    const tax = results.totalTaxes;
    const plat = results.platformDeductions;
    const exp = results.expenses;

    const segments = [
      { label: 'Net Profit', value: net, color: '#34d399' },
      { label: 'Est. Taxes', value: '#ef4444', color: '#ef4444' },
      { label: 'Platform Fees', value: plat, color: '#6366f1' },
      { label: 'Expenses', value: exp, color: '#f59e0b' },
    ].filter((s) => s.value > 0);

    let cumulativePercentage = 0;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    return segments.map((seg) => {
      const percentage = (seg.value / total) * 100;
      const strokeLength = (percentage / 100) * circumference;
      const strokeOffset = circumference - (cumulativePercentage / 100) * circumference;
      cumulativePercentage += percentage;
      return { ...seg, strokeLength, strokeOffset, percentage };
    });
  };

  const chartSegments = getChartData();

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Form Container */}
        <form onSubmit={handleCalculate} className="flex-1 rounded-2xl bg-slate-900/40 p-6 border border-slate-800 shadow-xl backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-sans">
            <Briefcase className="h-5 w-5 text-mint-green" />
            Estimate Quarterly Freelance Taxes
          </h3>

          <div className="space-y-4">
            {/* Period Toggle */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Calculation Frequency</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPeriod('quarterly')}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    period === 'quarterly'
                      ? 'bg-mint-green text-slate-dark shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Quarterly Basis
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('annual')}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    period === 'annual'
                      ? 'bg-mint-green text-slate-dark shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Annualized Basis
                </button>
              </div>
            </div>

            {/* Income Input */}
            <div>
              <label htmlFor="grossIncome" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Gross Freelance Income (USD Base)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 font-mono text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="grossIncome"
                  id="grossIncome"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-8 pr-4 text-white focus:border-mint-green focus:outline-none focus:ring-1 focus:ring-mint-green text-base font-number"
                  placeholder="e.g. 15000"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Platform Selector */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="platform" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Platform
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 px-4 text-white focus:border-mint-green focus:outline-none focus:ring-1 focus:ring-mint-green text-sm"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="commissionRate" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Commission (%)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    id="commissionRate"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    disabled={platform !== 'custom'}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-white focus:border-mint-green focus:outline-none focus:ring-1 focus:ring-mint-green text-sm font-number disabled:opacity-50"
                    placeholder="10"
                    min="0"
                    max="100"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Percent className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div>
              <label htmlFor="expenses" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Deductible Expenses (USD Base)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 font-mono text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="expenses"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-8 pr-4 text-white focus:border-mint-green focus:outline-none focus:ring-1 focus:ring-mint-green text-base font-number"
                  placeholder="e.g. 1500"
                  min="0"
                />
              </div>
            </div>

            {/* State & Federal Rates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fedTaxRate" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Est. Fed Tax (%)
                </label>
                <input
                  type="number"
                  id="fedTaxRate"
                  value={fedTaxRate}
                  onChange={(e) => setFedTaxRate(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-white focus:border-mint-green focus:outline-none focus:ring-1 focus:ring-mint-green text-sm font-number"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label htmlFor="stateTaxRate" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Est. State Tax (%)
                </label>
                <input
                  type="number"
                  id="stateTaxRate"
                  value={stateTaxRate}
                  onChange={(e) => setStateTaxRate(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-white focus:border-mint-green focus:outline-none focus:ring-1 focus:ring-mint-green text-sm font-number"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 leading-normal">{error}</p>}

            <button
              id="gig-tax-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl btn-primary py-3.5 px-4 font-bold cursor-pointer text-base focus:ring-2 focus:ring-mint-green disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Calculate Estimates'
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
              <HelpCircle className="h-12 w-12 text-slate-700 mb-3 animate-pulse" />
              <p className="text-base font-semibold text-slate-300">Awaiting Estimates</p>
              <p className="text-xs text-slate-500 max-w-[240px] mt-1 leading-normal">
                Enter your gross income and expenses details, then click calculate to analyze quarterly margins.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              {/* Currency Selector + Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Calculated Net Margin</h4>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-black text-mint-green font-number glow-mint">{formattedCurrency(results.netRevenue)}</span>
                    <span className="text-xs font-semibold text-slate-500">{results.period === 'quarterly' ? '/ Quarter' : '/ Year'}</span>
                  </div>
                </div>

                {/* Live Currency Selector */}
                <div>
                  <label htmlFor="currency-select-tax" className="sr-only">Select Currency</label>
                  <select
                    id="currency-select-tax"
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

              {/* Share & Copy URL Module */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Share Calculation</span>
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
                      title="Copy Link to Clipboard"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* SVG Donut Visual */}
              <div className="flex flex-col md:flex-row items-center gap-6 py-2 border-y border-slate-800/60">
                {/* SVG Donut */}
                <div className="relative flex-shrink-0 w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="transparent" stroke="#1f2937" strokeWidth="10" />
                    {chartSegments?.map((seg, i) => (
                      <circle
                        key={i}
                        cx="60"
                        cy="60"
                        r="50"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="10"
                        strokeDasharray={`314.16`}
                        strokeDashoffset={seg.strokeOffset}
                        className="transition-all duration-500"
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: `${seg.strokeLength} ${314.16 - seg.strokeLength}`,
                        }}
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Margin</span>
                    <span className="text-xs font-black text-white font-number mt-0.5">{results.profitMargin}%</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 grid grid-cols-2 gap-2 text-xs w-full">
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-mint-green" />
                    <div>
                      <p className="text-[10px] text-slate-400">Net Profit</p>
                      <p className="text-white font-extrabold font-number">{formattedCurrency(results.netRevenue)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-rose-500" />
                    <div>
                      <p className="text-[10px] text-slate-400">Taxes</p>
                      <p className="text-white font-extrabold font-number">{formattedCurrency(results.totalTaxes)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-indigo-500" />
                    <div>
                      <p className="text-[10px] text-slate-400">Platform</p>
                      <p className="text-white font-extrabold font-number">{formattedCurrency(results.platformDeductions)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-amber-500" />
                    <div>
                      <p className="text-[10px] text-slate-400">Expenses</p>
                      <p className="text-white font-extrabold font-number">{formattedCurrency(results.expenses)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Fed Self-Employment Tax (15.3%)</span>
                  <span className="text-white font-bold font-number">{formattedCurrency(results.fedSETax)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1">
                    Federal Income Tax ({fedTaxRate}%)
                    <span className="group relative">
                      <Info className="h-3.5 w-3.5 text-slate-500 cursor-help" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden w-44 rounded bg-slate-950 p-2 text-[10px] text-slate-300 border border-slate-800 group-hover:block z-20 leading-relaxed">
                        Calculated at {fedTaxRate}% rate on net business earnings.
                      </span>
                    </span>
                  </span>
                  <span className="text-white font-bold font-number">{formattedCurrency(results.fedIncomeTax)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">State Income Tax ({stateTaxRate}%)</span>
                  <span className="text-white font-bold font-number">{formattedCurrency(results.stateIncomeTax)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
