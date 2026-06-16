'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface QuotePageProps {
  params: Promise<{ id: string }>;
}

export default function QuotePage({ params }: QuotePageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/share?id=${id}`);
        const result = await res.json();
        if (result.success) {
          // Store in sessionStorage to populate inputs on home page loading
          sessionStorage.setItem('nichecalc_shared_quote', JSON.stringify(result.data));
          // Redirect to home page
          router.replace('/');
        } else {
          setError(result.error || 'Configuration link expired or not found.');
        }
      } catch (err) {
        setError('Failed to fetch sharing configuration.');
      }
    };
    
    fetchConfig();
  }, [id, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center p-6 text-slate-300">
      {error ? (
        <div className="max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-sm text-red-400 font-bold mb-3">Unable to restore calculation</p>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">{error}</p>
          <button
            onClick={() => router.replace('/')}
            className="rounded-xl btn-primary py-2.5 px-6 text-sm font-bold cursor-pointer transition-all"
          >
            Go to Calculators Home
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-mint-green" />
          <h2 className="text-base font-bold text-white">Restoring Saved Calculation</h2>
          <p className="text-xs text-slate-400">Loading custom parameters for configuration ID: <span className="font-mono text-white">{id}</span>...</p>
        </div>
      )}
    </div>
  );
}
