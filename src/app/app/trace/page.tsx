'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/shared/AppHeader';
import { TraceGraph } from '@/components/trace/TraceGraph';
import { TraceResult } from '@/types/traceability';
import { 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  Scale, 
  AlertTriangle, 
  Download, 
  Plus, 
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

function TraceExplorerInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || 'L-204';

  const [query, setQuery] = useState(initialQuery);
  const [direction, setDirection] = useState<'FORWARD' | 'BACKWARD'>('FORWARD');
  const [loading, setLoading] = useState(false);
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeTrace = async (targetId: string, traceDir: 'FORWARD' | 'BACKWARD') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = traceDir === 'FORWARD' 
        ? `/api/trace/forward?lotId=${encodeURIComponent(targetId)}`
        : `/api/trace/backward?entityId=${encodeURIComponent(targetId)}`;

      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        setTraceResult(data.data);
      } else {
        setError(data.error || 'Trace failed');
      }
    } catch (err: any) {
      setError(err.message || 'Trace request failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeTrace(query, direction);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    executeTrace(query, direction);
  };

  const handleExportJSON = () => {
    if (!traceResult) return;
    const blob = new Blob([JSON.stringify(traceResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BatchTrace_${traceResult.rootEntity.id}_${traceResult.direction}.json`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Traceability explorer"
        description="Deterministic forward and backward supply chain graph traversal with mass balance reconciliation."
      />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Search & Mode Bar */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E6DF] shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[260px] relative">
              <Search className="w-4 h-4 text-[#527D68] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Lot code (L-204), Batch (PB-031), Finished Lot (FP-101), Order (ORD-101)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E6DF] text-xs text-[#27343A] font-medium focus:outline-none focus:ring-2 focus:ring-[#173D32]"
              />
            </div>

            {/* Forward / Backward Direction Toggle */}
            <div className="flex items-center bg-[#F7F6F0] p-1 rounded-xl border border-[#E2E6DF]">
              <button
                type="button"
                onClick={() => {
                  setDirection('FORWARD');
                  executeTrace(query, 'FORWARD');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  direction === 'FORWARD'
                    ? 'bg-[#173D32] text-white shadow-xs'
                    : 'text-[#66746F] hover:text-[#173D32]'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Forward (Impact)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirection('BACKWARD');
                  executeTrace(query, 'BACKWARD');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  direction === 'BACKWARD'
                    ? 'bg-[#173D32] text-white shadow-xs'
                    : 'text-[#66746F] hover:text-[#173D32]'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Backward (Root Cause)</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors shadow-xs"
            >
              {loading ? 'Traversing...' : 'Trace Entity'}
            </button>
          </form>

          {/* Quick entity tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0F2ED] text-xs">
            <span className="text-[#66746F] font-semibold text-[11px]">Quick Samples:</span>
            {[
              { id: 'L-204', label: 'Lot L-204 (Flagged Oats)', dir: 'FORWARD' },
              { id: 'L-205', label: 'Lot L-205 (Honey)', dir: 'FORWARD' },
              { id: 'PB-031', label: 'Batch PB-031', dir: 'FORWARD' },
              { id: 'FP-101', label: 'Finished FP-101', dir: 'BACKWARD' },
              { id: 'ORD-101', label: 'Order ORD-101 (Whole Foods)', dir: 'BACKWARD' },
            ].map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setQuery(sample.id);
                  setDirection(sample.dir as 'FORWARD' | 'BACKWARD');
                  executeTrace(sample.id, sample.dir as 'FORWARD' | 'BACKWARD');
                }}
                className="px-2.5 py-1 rounded-md bg-[#FAF9F5] border border-[#E2E6DF] hover:border-[#173D32] hover:bg-[#E8F3ED] text-[11px] font-mono text-[#173D32] font-semibold transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[#FCE9E7] text-[#B94343] border border-[#F5C2BE] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Trace Result Display */}
        {traceResult && (
          <div className="space-y-6">
            {/* Top Investigation Summary Bar */}
            <div className="bg-white p-4 rounded-xl border border-[#E2E6DF] shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase font-mono tracking-wider font-bold text-[#527D68]">
                  Traversed Trace Result Summary
                </span>
                <p className="text-xs text-[#27343A] font-medium">
                  {traceResult.investigationSummary}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E6DF] text-xs font-semibold text-[#27343A] hover:bg-[#F7F6F0] flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#527D68]" />
                  <span>Export JSON</span>
                </button>

                <Link
                  href={`/app/incidents?createTarget=${traceResult.rootEntity.id}&type=${traceResult.rootEntity.type}`}
                  className="px-3.5 py-1.5 rounded-lg bg-[#B94343] text-white hover:bg-red-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Draft Incident Report</span>
                </Link>
              </div>
            </div>

            {/* Quantity Discrepancies Callout */}
            {traceResult.quantityDiscrepancies.length > 0 && (
              <div className="p-4 rounded-xl bg-[#FFF3DB] border border-[#F5DC9C] text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#B8710E]">
                  <AlertTriangle className="w-4 h-4 text-[#E9A23B]" />
                  <span>Mass Balance Discrepancy Flagged</span>
                </div>
                {traceResult.quantityDiscrepancies.map((d, i) => (
                  <p key={i} className="text-[#66746F] leading-snug pl-6">
                    &bull; {d.description}
                  </p>
                ))}
              </div>
            )}

            {/* 2D Interactive Trace Graph */}
            <TraceGraph traceResult={traceResult} />
          </div>
        )}
      </main>
    </div>
  );
}

export default function TraceExplorerPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 text-xs text-[#527D68]">
        Loading Traceability Explorer...
      </div>
    }>
      <TraceExplorerInner />
    </Suspense>
  );
}
