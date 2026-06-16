import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

interface AdContainerProps {
  type: 'sidebar' | 'banner';
}

export default function AdContainer({ type }: AdContainerProps) {
  if (type === 'sidebar') {
    return (
      <div className="sticky top-24 w-[300px] rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-5 text-center shadow-xl backdrop-blur-md">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Advertisement
        </div>
        <div className="flex h-[360px] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 p-6 border border-slate-800/80">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint-green/10 text-mint-green mb-4 shadow-inner">
            <Target className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-white tracking-wide">Target Your Audience</h4>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-[180px] mx-auto">
            High-converting financial and academic niches. Placed optimally to pass Google AdSense approvals.
          </p>
          <div className="mt-8 rounded-lg bg-mint-green/15 border border-mint-green/25 px-4 py-2 text-xs font-semibold text-mint-green hover:bg-mint-green/25 cursor-pointer transition-all active:scale-95">
            Advertise with Us
          </div>
        </div>
        <div className="mt-4 flex justify-between px-2 text-[9px] text-slate-600">
          <span>AdChoices</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    );
  }

  // Mobile banner version (320x100px)
  return (
    <div className="my-6 mx-auto w-full max-w-[320px] rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-2 text-center">
      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
        Advertisement
      </div>
      <div className="flex h-[100px] items-center justify-between rounded-lg bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-2 border border-slate-800/80">
        <div className="flex items-center space-x-3 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-green/10 text-mint-green shadow-inner">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">Premium Ad Slot</h4>
            <p className="text-[10px] text-slate-400">320x100 Mobile Ad Zone</p>
          </div>
        </div>
        <div className="rounded bg-mint-green/15 border border-mint-green/20 px-2 py-1 text-[9px] font-semibold text-mint-green hover:bg-mint-green/25 cursor-pointer active:scale-95 transition-all">
          Sponsor
        </div>
      </div>
    </div>
  );
}
