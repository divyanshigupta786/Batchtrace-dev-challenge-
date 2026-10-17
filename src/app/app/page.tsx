'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/shared/AppHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { traceStore } from '@/lib/store/traceStore';
import { 
  Box, 
  Layers, 
  ShoppingBag, 
  AlertOctagon, 
  FileText, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  Upload, 
  Search, 
  CheckCircle2, 
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function DashboardPage() {
  const [resetTick, setResetTick] = useState(0);

  const handleReset = async () => {
    await fetch('/api/seed', { method: 'POST' });
    setResetTick(prev => prev + 1);
  };

  const lotCount = traceStore.ingredientLots.length;
  const batchCount = traceStore.productionBatches.length;
  const finishedLotCount = traceStore.finishedLots.length;
  const activeIncidents = traceStore.incidents.filter(i => i.status !== 'CLOSED').length;
  const pendingDocs = traceStore.documents.filter(d => d.status === 'REVIEW_REQUIRED').length;

  const chartData = [
    { name: 'Oats (L-204)', consumed: 1250, received: 1200 },
    { name: 'Honey (L-205)', consumed: 420, received: 600 },
    { name: 'Cacao (L-206)', consumed: 280, received: 400 },
    { name: 'Coconut (L-207)', consumed: 210, received: 300 },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Operations overview"
        description="Monitor batch traceability, document quality, and active investigations."
        onResetDemo={handleReset}
      />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Quick Action Banner */}
        <div className="bg-[#173D32] rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E9A23B] animate-pulse" />
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[#DCE8DF]">
                Active Quality Notification
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Supplier Lot L-204 flagged for potential mycotoxin elevation
            </h3>
            <p className="text-xs text-[#CBD8D1] max-w-xl">
              2 production batches (PB-031, PB-032) and 5 retail dispatches impacted. 1 unreviewed batch record requires sign-off.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/app/agent?prompt=Investigate+supplier+lot+L-204+and+show+affected+orders"
              className="px-3.5 py-2 rounded-xl bg-white text-[#173D32] hover:bg-[#F7F6F0] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#527D68]" />
              <span>AI Investigation</span>
            </Link>
            <Link
              href="/app/trace?search=L-204"
              className="px-3.5 py-2 rounded-xl bg-[#E9A23B] text-black hover:bg-amber-400 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore Graph</span>
            </Link>
          </div>
        </div>

        {/* 5 Core Database Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E6DF] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#66746F] font-medium">Ingredient Lots</span>
              <Box className="w-4 h-4 text-[#527D68]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#173D32]">{lotCount}</div>
            <span className="text-[11px] text-[#B94343] font-medium flex items-center gap-1 mt-1">
              1 Lot Flagged
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E6DF] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#66746F] font-medium">Production Batches</span>
              <Layers className="w-4 h-4 text-[#527D68]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#173D32]">{batchCount}</div>
            <span className="text-[11px] text-[#66746F] font-medium mt-1 block">All completed</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E6DF] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#66746F] font-medium">Finished Lots</span>
              <ShoppingBag className="w-4 h-4 text-[#527D68]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#173D32]">{finishedLotCount}</div>
            <span className="text-[11px] text-[#B8710E] font-medium mt-1 block">2 on QA Hold</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E6DF] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#66746F] font-medium">Active Investigations</span>
              <AlertOctagon className="w-4 h-4 text-[#B94343]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#B94343]">{activeIncidents}</div>
            <span className="text-[11px] text-[#B94343] font-medium mt-1 block">INC-001 (Needs Review)</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E6DF] shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#66746F] font-medium">Awaiting Review</span>
              <FileText className="w-4 h-4 text-[#E9A23B]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#E9A23B]">{pendingDocs}</div>
            <Link href="/app/documents" className="text-[11px] text-[#173D32] font-semibold hover:underline mt-1 block">
              Review DOC-804 &rarr;
            </Link>
          </div>
        </div>

        {/* Two-Column Layout: Data Quality Warnings & Recharts Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Data Quality Warning Panel (Left 7 cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#E2E6DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2ED]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E9A23B]" />
                <h3 className="text-sm font-bold text-[#173D32]">Data Quality &amp; Integrity Alert Panel</h3>
              </div>
              <span className="text-xs text-[#66746F]">3 active alerts</span>
            </div>

            <div className="space-y-3">
              {/* Alert 1: Quantity Discrepancy */}
              <div className="p-3.5 rounded-xl bg-[#FFF3DB]/60 border border-[#F5DC9C] flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#E9A23B] shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#27343A]">Negative Quantity Variance on Lot L-204</span>
                    <span className="text-[10px] font-mono bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-bold">-50 kg</span>
                  </div>
                  <p className="text-[#66746F] leading-snug">
                    Received: 1,200 kg. Consumed across PB-031 (800 kg) and PB-032 (450 kg) = 1,250 kg. Over-consumption variance detected.
                  </p>
                  <Link href="/app/trace?search=L-204" className="text-[#173D32] font-semibold hover:underline mt-1.5 inline-block">
                    Inspect in Traceability Explorer &rarr;
                  </Link>
                </div>
              </div>

              {/* Alert 2: Unreviewed Document */}
              <div className="p-3.5 rounded-xl bg-[#FFF3DB]/60 border border-[#F5DC9C] flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#E9A23B] shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#27343A]">Document DOC-804 Awaiting QA Sign-Off</span>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">Review Required</span>
                  </div>
                  <p className="text-[#66746F] leading-snug">
                    Batch sheet for PB-032 extracted via AI. Links remain in &quot;POSSIBLE&quot; certainty state until an authorized QA user approves.
                  </p>
                  <Link href="/app/documents/DOC-804" className="text-[#173D32] font-semibold hover:underline mt-1.5 inline-block">
                    Review and Approve Document &rarr;
                  </Link>
                </div>
              </div>

              {/* Alert 3: Missing Order Item Links */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <AlertOctagon className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#27343A]">Order ORD-109 Missing Item Reference</span>
                    <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">Incomplete</span>
                  </div>
                  <p className="text-[#66746F] leading-snug">
                    Customer order ORD-109 (Wegmans) lacks explicit finished lot linkage in shipping BOL.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Analytics Panel (Right 5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E2E6DF] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2ED] mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#527D68]" />
                  <h3 className="text-sm font-bold text-[#173D32]">Mass Balance Reconciliation (kg)</h3>
                </div>
                <span className="text-[11px] text-[#66746F]">Received vs Consumed</span>
              </div>
              <p className="text-[11px] text-[#66746F] mb-4">
                Compares received raw material inventory against validated batch execution records.
              </p>
            </div>

            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F2ED" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#66746F" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#66746F" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#102C25', color: '#fff', borderRadius: '8px', fontSize: '11px' }} 
                  />
                  <Bar dataKey="received" fill="#527D68" name="Received (kg)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="consumed" fill="#E9A23B" name="Consumed (kg)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 pt-3 border-t border-[#F0F2ED] text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#527D68]" />
                <span className="text-[#66746F]">Received Mass</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#E9A23B]" />
                <span className="text-[#66746F]">Batch Usage Mass</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Active Investigations & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Investigations Table (8 cols) */}
          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-[#E2E6DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2ED]">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-[#173D32]" />
                <h3 className="text-sm font-bold text-[#173D32]">Active Incident Investigations</h3>
              </div>
              <Link href="/app/incidents" className="text-xs font-semibold text-[#527D68] hover:text-[#173D32]">
                View All &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F0F2ED] text-[#66746F]">
                    <th className="pb-2 font-semibold">Incident #</th>
                    <th className="pb-2 font-semibold">Target Entity</th>
                    <th className="pb-2 font-semibold">Title</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2ED]">
                  {traceStore.incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-3 font-mono font-bold text-[#173D32]">{inc.incidentNumber}</td>
                      <td className="py-3 font-mono">
                        <span className="bg-[#E8F3ED] text-[#173D32] px-1.5 py-0.5 rounded font-bold">
                          {inc.targetLotOrBatch}
                        </span>
                      </td>
                      <td className="py-3 max-w-xs font-medium text-[#27343A] truncate">{inc.title}</td>
                      <td className="py-3">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/app/incidents/${inc.id}`}
                          className="font-semibold text-[#173D32] hover:underline"
                        >
                          Open Dossier &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed (4 cols) */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#E2E6DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2ED]">
              <h3 className="text-sm font-bold text-[#173D32]">Audit Log Feed</h3>
              <Link href="/app/audit" className="text-xs text-[#527D68] hover:underline">
                Full Trail
              </Link>
            </div>

            <div className="space-y-3">
              {traceStore.auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs border-b border-[#F0F2ED] pb-2.5 last:border-none">
                  <div className="flex items-center justify-between text-[#66746F] mb-1">
                    <span className="font-semibold text-[#27343A]">{log.actor.name}</span>
                    <span className="font-mono text-[10px]">{log.timestamp.slice(11, 16)}</span>
                  </div>
                  <p className="text-[#27343A] line-clamp-2 leading-snug">{log.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
