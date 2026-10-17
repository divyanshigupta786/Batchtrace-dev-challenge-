'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Cpu, 
  Clock, 
  Zap, 
  Check, 
  X, 
  AlertOctagon, 
  ShieldCheck, 
  ArrowRight,
  Database
} from 'lucide-react';
import Link from 'next/link';

export function ComparisonShowcase() {
  const [activeTab, setActiveTab] = useState<'after' | 'before'>('after');

  return (
    <div className="bg-[#FAF9F5] rounded-3xl p-6 sm:p-10 border border-[#E2E6DF] shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#527D68] block mb-1">
            Operational Comparison
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#173D32] tracking-tight">
            Manual Spreadsheet Hunt vs. BatchTrace Intelligence
          </h3>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-[#E8EDE6] p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab('after')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'after'
                ? 'bg-[#173D32] text-white shadow-xs'
                : 'text-[#66746F] hover:text-[#27343A]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#E9A23B]" />
            <span>BatchTrace Platform</span>
          </button>
          <button
            onClick={() => setActiveTab('before')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'before'
                ? 'bg-[#B94343] text-white shadow-xs'
                : 'text-[#66746F] hover:text-[#27343A]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Disconnected Spreadsheets</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'after' ? (
          <motion.div
            key="after"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white p-6 rounded-2xl border border-[#C6DEC6] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#173D32] bg-[#E8F3ED] px-2.5 py-1 rounded-md">
                  SPEED &amp; EFFICIENCY
                </span>
                <Zap className="w-5 h-5 text-[#E9A23B]" />
              </div>
              <h4 className="font-extrabold text-base text-[#173D32]">&lt; 3 Seconds Investigation</h4>
              <p className="text-xs text-[#66746F] leading-relaxed">
                Deterministic graph traversal immediately resolves forward impact from Lot L-204 to batches, finished goods, and retailers.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#173D32]">
                <Check className="w-4 h-4 text-[#527D68]" />
                <span>Instant QA decision readiness</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#C6DEC6] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#173D32] bg-[#E8F3ED] px-2.5 py-1 rounded-md">
                  MASS BALANCE AUDIT
                </span>
                <Database className="w-5 h-5 text-[#527D68]" />
              </div>
              <h4 className="font-extrabold text-base text-[#173D32]">Automatic Discrepancy Flag</h4>
              <p className="text-xs text-[#66746F] leading-relaxed">
                Mass balance reconciliation immediately caught the 50 kg over-consumption across PB-031 and PB-032.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#173D32]">
                <Check className="w-4 h-4 text-[#527D68]" />
                <span>Strict unit normalization &amp; balance checks</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#C6DEC6] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#173D32] bg-[#E8F3ED] px-2.5 py-1 rounded-md">
                  LEGAL PROVENANCE
                </span>
                <Cpu className="w-5 h-5 text-[#173D32]" />
              </div>
              <h4 className="font-extrabold text-base text-[#173D32]">100% Grounded Evidence</h4>
              <p className="text-xs text-[#66746F] leading-relaxed">
                Every factual claim is cited to exact stored PDFs, rows, and line items. Zero AI hallucinations.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#173D32]">
                <Check className="w-4 h-4 text-[#527D68]" />
                <span>Audit-ready printable incident report</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="before"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-[#FFF5F5] p-6 rounded-2xl border border-[#F2C2C2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#B94343] bg-white px-2.5 py-1 rounded-md">
                  MANUAL LATENCY
                </span>
                <Clock className="w-5 h-5 text-[#B94343]" />
              </div>
              <h4 className="font-extrabold text-base text-[#B94343]">48 &ndash; 72 Hours Lost</h4>
              <p className="text-xs text-[#66746F] leading-relaxed">
                Plant managers and QA analysts manually compare paper batch logs, Excel sheets, and email threads under panic.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#B94343]">
                <X className="w-4 h-4 text-[#B94343]" />
                <span>Dangerous recall execution delay</span>
              </div>
            </div>

            <div className="bg-[#FFF5F5] p-6 rounded-2xl border border-[#F2C2C2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#B94343] bg-white px-2.5 py-1 rounded-md">
                  BLIND SPOTS
                </span>
                <AlertOctagon className="w-5 h-5 text-[#B94343]" />
              </div>
              <h4 className="font-extrabold text-base text-[#B94343]">Overlooked Discrepancies</h4>
              <p className="text-xs text-[#66746F] leading-relaxed">
                Over-consumption of 50 kg goes completely unnoticed in spreadsheets until regulatory auditors flag it.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#B94343]">
                <X className="w-4 h-4 text-[#B94343]" />
                <span>High regulatory exposure &amp; fines</span>
              </div>
            </div>

            <div className="bg-[#FFF5F5] p-6 rounded-2xl border border-[#F2C2C2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#B94343] bg-white px-2.5 py-1 rounded-md">
                  UNRELIABLE NOTES
                </span>
                <FileSpreadsheet className="w-5 h-5 text-[#B94343]" />
              </div>
              <h4 className="font-extrabold text-base text-[#B94343]">Unverifiable Claims</h4>
              <p className="text-xs text-[#66746F] leading-relaxed">
                Ad-hoc notes and copy-pasted formulas lack row-level provenance, making defense during an FDA or SQF audit difficult.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#B94343]">
                <X className="w-4 h-4 text-[#B94343]" />
                <span>No tamper-evident audit trail</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-[#E2E6DF] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#66746F]">
          <span className="w-2 h-2 rounded-full bg-[#527D68]" />
          <span>Every verified batch record is cryptographically indexed and isolated by organization.</span>
        </div>
        <Link
          href="/how-it-works"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173D32] hover:text-[#102C25] hover:underline"
        >
          <span>Explore Technical Architecture</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
