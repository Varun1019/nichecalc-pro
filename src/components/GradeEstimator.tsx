'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GraduationCap, Percent, Award, AlertTriangle, CheckCircle, Loader2, Share2, Clipboard, Check } from 'lucide-react';
import AdContainer from '@/components/AdContainer';

interface GradeCategory {
  id: string;
  name: string;
  weight: number;
  score: number;
}

interface GradeEstimatorProps {
  onCalculateSuccess?: () => void;
  initialInputs?: any;
}

export default function GradeEstimator({ onCalculateSuccess, initialInputs }: GradeEstimatorProps) {
  // State for syllabus rows
  const [categories, setCategories] = useState<GradeCategory[]>([
    { id: '1', name: 'Homework', weight: 30, score: 95 },
    { id: '2', name: 'Midterm Exam', weight: 25, score: 82 },
    { id: '3', name: 'Quizzes / Projects', weight: 15, score: 88 },
  ]);

  // State for final exam inputs
  const [finalWeight, setFinalWeight] = useState<number>(30);
  const [targetGrade, setTargetGrade] = useState<number>(90);

  // Outputs
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Share link states
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Hydrate custom inputs from sharing redirect links
  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.categories) setCategories(initialInputs.categories);
      if (initialInputs.finalWeight) setFinalWeight(parseFloat(initialInputs.finalWeight));
      if (initialInputs.targetGrade) setTargetGrade(parseFloat(initialInputs.targetGrade));
      
      // Auto trigger calculate
      setTimeout(() => {
        const calculateBtn = document.getElementById('grade-estimator-submit');
        if (calculateBtn) calculateBtn.click();
      }, 100);
    }
  }, [initialInputs]);

  const handleAddCategory = () => {
    const newId = (categories.length + 1).toString() + '_' + Date.now();
    setCategories([...categories, { id: newId, name: 'New Category', weight: 10, score: 90 }]);
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  const handleRowChange = (id: string, field: 'name' | 'weight' | 'score', value: any) => {
    setCategories(
      categories.map((cat) => {
        if (cat.id === id) {
          if (field === 'name') return { ...cat, name: value };
          const numVal = parseFloat(value) || 0;
          return { ...cat, [field]: numVal };
        }
        return cat;
      })
    );
  };

  const calculateGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShareUrl(null); // Reset share URL when new details are entered

    // Sum weights
    const totalCatWeight = categories.reduce((sum, c) => sum + c.weight, 0);
    const totalWeight = totalCatWeight + finalWeight;

    if (Math.abs(totalWeight - 100) > 0.1) {
      setError(`Syllabus weights must sum to exactly 100%. Currently: ${totalWeight}% (Categories: ${totalCatWeight}%, Final Exam: ${finalWeight}%)`);
      setLoading(false);
      return;
    }

    if (categories.some((c) => c.weight <= 0)) {
      setError('Each category weight must be greater than 0%.');
      setLoading(false);
      return;
    }

    // Current weighted score (out of points completed so far)
    const pointsCompleted = categories.reduce((sum, c) => sum + (c.weight * c.score) / 100, 0);
    const currentStanding = totalCatWeight > 0 ? (pointsCompleted / totalCatWeight) * 100 : 0;

    // Required final score: (Target - Current points earned) / Final Weight * 100
    const requiredFinalScore = ((targetGrade - pointsCompleted) / finalWeight) * 100;

    const letterGrade = (score: number) => {
      if (score >= 90) return 'A';
      if (score >= 80) return 'B';
      if (score >= 70) return 'C';
      if (score >= 60) return 'D';
      return 'F';
    };

    const calcOutputs = {
      totalCatWeight,
      pointsCompleted: parseFloat(pointsCompleted.toFixed(2)),
      currentStanding: parseFloat(currentStanding.toFixed(2)),
      currentStandingLetter: letterGrade(currentStanding),
      requiredFinalScore: parseFloat(requiredFinalScore.toFixed(2)),
      finalWeight,
      targetGrade,
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
            calcType: 'grade-estimator',
            inputParameters: { categories, finalWeight, targetGrade },
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

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calcType: 'grade-estimator',
          inputParameters: { categories, finalWeight, targetGrade },
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

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Form Container */}
        <form onSubmit={calculateGrade} className="flex-1 rounded-2xl bg-slate-900/40 p-6 border border-slate-800 shadow-xl backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-sans">
            <GraduationCap className="h-5 w-5 text-mint-green" />
            Class Grade & Final Exam Estimator
          </h3>

          <div className="space-y-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Syllabus Categories (excluding final)
            </div>

            {/* List of categories */}
            <div className="space-y-3">
              {categories.map((cat, index) => (
                <div key={cat.id} className="flex items-center gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleRowChange(cat.id, 'name', e.target.value)}
                      placeholder="e.g. Homework"
                      className="w-full bg-transparent border-none text-sm font-semibold text-white focus:outline-none focus:ring-0 placeholder:text-slate-700"
                      required
                    />
                  </div>

                  <div className="w-20">
                    <label className="sr-only">Weight %</label>
                    <div className="relative rounded-lg shadow-sm">
                      <input
                        type="number"
                        value={cat.weight}
                        onChange={(e) => handleRowChange(cat.id, 'weight', e.target.value)}
                        placeholder="Weight"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-2 text-xs text-white text-right pr-6 focus:border-mint-green focus:outline-none font-number"
                        min="1"
                        max="100"
                        required
                      />
                      <span className="absolute inset-y-0 right-2 flex items-center text-[10px] text-slate-500 font-mono">%</span>
                    </div>
                  </div>

                  <div className="w-20">
                    <label className="sr-only">Score %</label>
                    <div className="relative rounded-lg shadow-sm">
                      <input
                        type="number"
                        value={cat.score}
                        onChange={(e) => handleRowChange(cat.id, 'score', e.target.value)}
                        placeholder="Score"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-2 text-xs text-white text-right pr-6 focus:border-mint-green focus:outline-none font-number"
                        min="0"
                        max="200"
                        required
                      />
                      <span className="absolute inset-y-0 right-2 flex items-center text-[10px] text-slate-500 font-mono">%</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat.id)}
                    disabled={categories.length <= 1}
                    className="p-1 text-slate-600 hover:text-red-400 disabled:opacity-30 cursor-pointer"
                    aria-label="Remove category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddCategory}
              className="mt-2 flex items-center gap-1 text-xs font-bold text-mint-green hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Syllabus Category
            </button>

            {/* Target and Final weight fields */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
              <div>
                <label htmlFor="finalWeight" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Final Exam Weight (%)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    id="finalWeight"
                    value={finalWeight}
                    onChange={(e) => setFinalWeight(parseFloat(e.target.value) || 0)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-white focus:border-mint-green focus:outline-none focus:ring-1 focus:ring-mint-green text-sm font-number"
                    min="1"
                    max="99"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Percent className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="targetGrade" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Desired Grade (%)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    id="targetGrade"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(parseFloat(e.target.value) || 0)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-white focus:border-mint-green focus:outline-none focus:ring-1 focus:ring-mint-green text-sm font-number"
                    min="1"
                    max="150"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Percent className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 leading-relaxed">{error}</p>}

            <button
              id="grade-estimator-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl btn-primary py-3.5 px-4 font-bold cursor-pointer text-base focus:ring-2 focus:ring-mint-green disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing Syllabus...
                </>
              ) : (
                'Calculate Target Score'
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
              <GraduationCap className="h-12 w-12 text-slate-700 mb-3 animate-pulse" />
              <p className="text-base font-semibold text-slate-300">Awaiting Syllabus Input</p>
              <p className="text-xs text-slate-500 max-w-[240px] mt-1 leading-normal">
                Enter your syllabus component weights and grades, and define your desired course target.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              {/* Headings */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Required Final Exam Score</h4>
                <div className="flex items-baseline space-x-1.5">
                  <span
                    className={`text-3xl font-black font-number glow-mint ${
                      results.requiredFinalScore > 100
                        ? 'text-amber-400'
                        : 'text-mint-green'
                    }`}
                  >
                    {results.requiredFinalScore <= 0 ? '0%' : `${results.requiredFinalScore}%`}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">to get {results.targetGrade}% Overall</span>
                </div>

                {/* Status Notice */}
                {results.requiredFinalScore > 100 ? (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-400 border border-amber-500/20 leading-relaxed">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Extremely Hard:</span> Score exceeds 100%. You will need extra credit on the final exam to secure your target grade.
                    </div>
                  </div>
                ) : results.requiredFinalScore <= 0 ? (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs text-mint-green border border-emerald-500/20 leading-relaxed">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Guaranteed Success:</span> You already earned enough points! Even a 0% on the final exam secures your target.
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs text-mint-green border border-emerald-500/20 leading-relaxed">
                    <Award className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Achievable Target:</span> You need a score of {results.requiredFinalScore}% on the final to reach your goal.
                    </div>
                  </div>
                )}
              </div>

              {/* Share URL Module */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Share Class Setup</span>
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

              {/* Progress visual */}
              <div className="flex flex-col space-y-2 py-2 border-y border-slate-800/60">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Class Standing Breakdown</span>
                <div className="space-y-4 pt-1">
                  {/* Current standing */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Current Standing (Weight: {results.totalCatWeight}%)</span>
                      <span className="text-white font-bold font-number">{results.currentStanding}% ({results.currentStandingLetter})</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, results.currentStanding)}%` }}
                      />
                    </div>
                  </div>

                  {/* Target Standing */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Target Grade</span>
                      <span className="text-white font-bold font-number">{results.targetGrade}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-mint-green rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, results.targetGrade)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Points Accumulated So Far</span>
                  <span className="text-white font-bold font-number">{results.pointsCompleted} / {results.totalCatWeight}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Remaining Weight (Final Exam)</span>
                  <span className="text-white font-bold font-number">{results.finalWeight}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
