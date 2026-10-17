'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/shared/PublicNavbar';
import { PublicFooter } from '@/components/shared/PublicFooter';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  EyeOff, 
  History, 
  FileCheck2, 
  AlertOctagon,
  ArrowRight
} from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F0]">
      <PublicNavbar />

      <main className="flex-1 py-14 max-w-5xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#527D68] block mb-2">
            Trust &amp; Governance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#173D32] tracking-tight mb-4">
            Security, Provenance &amp; Compliance Safeguards
          </h1>
          <p className="text-base text-[#66746F] leading-relaxed max-w-2xl">
            Food traceability records contain proprietary formulas, supplier pricing, and sensitive client lists. 
            BatchTrace Agent isolates tenant data, bounds AI tools, and maintains an immutable audit trail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Tenant Isolation */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E6DF] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#E8F3ED] text-[#173D32] flex items-center justify-center">
              <Database className="w-5 h-5 text-[#173D32]" />
            </div>
            <h3 className="text-lg font-bold text-[#173D32]">Row-Level Tenant Isolation (RLS)</h3>
            <p className="text-xs text-[#66746F] leading-relaxed">
              Every table in the PostgreSQL database is indexed by `org_id` and enforced via Supabase Row Level Security. 
              Client-submitted organization IDs are discarded; all authorizations are derived from cryptographic server session tokens.
            </p>
          </div>

          {/* Card 2: No Model Training on Customer Files */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E6DF] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#E8F3ED] text-[#173D32] flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-[#173D32]" />
            </div>
            <h3 className="text-lg font-bold text-[#173D32]">Private Open-Weight Inference</h3>
            <p className="text-xs text-[#66746F] leading-relaxed">
              Our open-weight model architecture (Qwen3-4B / local Ollama) processes document fields in private memory. 
              Customer invoices, recipes, and contact records are never ingested into third-party public foundation model training corpora.
            </p>
          </div>

          {/* Card 3: Deterministic Source Grounding */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E6DF] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#E8F3ED] text-[#173D32] flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-[#173D32]" />
            </div>
            <h3 className="text-lg font-bold text-[#173D32]">Strict Provenance Grounding</h3>
            <p className="text-xs text-[#66746F] leading-relaxed">
              Every lot code, weight measurement, and carrier dispatch must cite a verified storage document ID, exact page number, 
              and row. AI responses that fail schema validation or contain ungrounded IDs are rejected by the runtime.
            </p>
          </div>

          {/* Card 4: Immutable Audit Trail */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E6DF] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#E8F3ED] text-[#173D32] flex items-center justify-center">
              <History className="w-5 h-5 text-[#173D32]" />
            </div>
            <h3 className="text-lg font-bold text-[#173D32]">Immutable Audit Trail</h3>
            <p className="text-xs text-[#66746F] leading-relaxed">
              Every document extraction approval, quantity flag, trace execution, and incident status advance logs actor name, 
              email, timestamp, and JSON before/after state diffs to support FDA FSMA 204 audits and GFSI certifications.
            </p>
          </div>
        </div>

        {/* Regulatory disclaimer */}
        <div className="p-6 bg-[#FAF9F5] rounded-2xl border border-[#E2E6DF] text-xs text-[#66746F] leading-relaxed mb-8">
          <h4 className="font-bold text-[#173D32] text-sm mb-1 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-[#B94343]" />
            Decision-Support Notice &amp; Regulatory Scope
          </h4>
          <p>
            BatchTrace Agent is specialized decision-support software designed to accelerate internal record retrieval and cross-document reconciliation. 
            It is not an autonomous food safety authority. Consequential actions such as supplier quarantines, customer notifications, or Class I/II/III food recalls 
            must be reviewed and authorized by designated Quality Assurance leadership in accordance with your company&apos;s standard operating procedures.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors"
          >
            <span>Enter the Authenticated Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
