'use client';

import React, { useState, useEffect } from 'react';
import GigTaxCalculator from '@/components/GigTaxCalculator';
import GradeEstimator from '@/components/GradeEstimator';
import EquityTracker from '@/components/EquityTracker';
import AdContainer from '@/components/AdContainer';
import ArticleSection from '@/components/ArticleSection';
import HistoryWidget from '@/components/HistoryWidget';
import { Briefcase, GraduationCap, Home, Sparkles } from 'lucide-react';

type TabType = 'gig-tax' | 'grade-estimator' | 'rent-to-own';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('gig-tax');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [sharedData, setSharedData] = useState<any>(null);

  const handleCalculateSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    try {
      const data = sessionStorage.getItem('nichecalc_shared_quote');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.calcType) {
          setActiveTab(parsed.calcType as TabType);
          setSharedData(parsed);
        }
        sessionStorage.removeItem('nichecalc_shared_quote');
      }
    } catch (e) {
      console.warn('Failed to parse shared quote parameters.', e);
    }
  }, []);

  const tabs = [
    { id: 'gig-tax', name: 'Gig-Tax Engine', icon: Briefcase, description: 'Freelance estimated tax returns' },
    { id: 'grade-estimator', name: 'Grade Estimator', icon: GraduationCap, description: 'Syllabus target final exam scores' },
    { id: 'rent-to-own', name: 'Equity Tracker', icon: Home, description: 'Lease vs home equity build up' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero header */}
      <div className="text-center mb-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-mint-green border border-mint-green/20 mb-4 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          Sub-Millisecond Financial &amp; Academic Analytics Suite
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl font-sans">
          Niche<span className="text-mint-green">Calc</span> Pro
        </h1>
        <p className="mt-4 text-sm md:text-base text-slate-400 leading-relaxed">
          Enterprise-grade financial tools designed to compute freelance quarterly margins, target exam scores, and home equity growth.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setSharedData(null); // Clear shared inputs on manual tab changes
              }}
              className={`flex items-start gap-4 rounded-2xl p-4 border text-left cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/10 border-mint-green text-white shadow-lg shadow-emerald-500/5 glow-mint'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60 hover:text-white'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                isActive ? 'bg-mint-green text-slate-dark font-extrabold' : 'bg-slate-800 text-slate-400'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>{tab.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-normal">{tab.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        {/* Left Side: Active Calculator + Article + History */}
        <div className="lg:col-span-2 space-y-8 w-full">
          {/* Active Calculator Component */}
          <div className="w-full">
            {activeTab === 'gig-tax' && (
              <GigTaxCalculator
                onCalculateSuccess={handleCalculateSuccess}
                initialInputs={sharedData?.calcType === 'gig-tax' ? sharedData.inputParameters : null}
              />
            )}
            {activeTab === 'grade-estimator' && (
              <GradeEstimator
                onCalculateSuccess={handleCalculateSuccess}
                initialInputs={sharedData?.calcType === 'grade-estimator' ? sharedData.inputParameters : null}
              />
            )}
            {activeTab === 'rent-to-own' && (
              <EquityTracker
                onCalculateSuccess={handleCalculateSuccess}
                initialInputs={sharedData?.calcType === 'rent-to-own' ? sharedData.inputParameters : null}
              />
            )}
          </div>

          {/* Dynamic Article boilerplates */}
          <ArticleSection calcType={activeTab} />

          {/* History Widget */}
          <HistoryWidget calcType={activeTab} refreshTrigger={refreshTrigger} />
        </div>

        {/* Right Side: Sticky Ad Container */}
        <div className="hidden lg:block lg:col-span-1 justify-self-center">
          <AdContainer type="sidebar" />
        </div>
      </div>
    </div>
  );
}
