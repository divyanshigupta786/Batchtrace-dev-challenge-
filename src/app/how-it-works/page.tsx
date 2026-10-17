'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/shared/PublicNavbar';
import { PublicFooter } from '@/components/shared/PublicFooter';
import { 
  FileSpreadsheet, 
  Database, 
  Network, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  GitBranch,
  Scale,
  FileCheck
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F0]">
      <PublicNavbar />

      <main className="flex-1 py-14 max-w-5xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#527D68] block mb-2">
            Technical Architecture &amp; Methodology
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#173D32] tracking-tight mb-4">
            How BatchTrace Agent Works
          </h1>
          <p className="text-base text-[#66746F] leading-relaxed max-w-2xl">
            A step-by-step walkthrough of how disconnected food manufacturing records become a navigable, 
            deterministic traceability graph powered by controlled open-weight AI.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1: Ingestion & Provenance */}
          <section className="bg-white p-8 rounded-2xl border border-[#E2E6DF] shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F3ED] text-[#173D32] flex items-center justify-center font-bold">
                01
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#173D32]">Document Ingestion &amp; Coordinate Provenance</h2>
                <span className="text-xs text-[#66746F]">CSV, XLSX, Text PDF, and Dock Logs</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#27343A] leading-relaxed mb-4">
              When documents are uploaded, BatchTrace validates file headers, validates MIME types, and uses deterministic regex parsers alongside AI extraction to parse supplier invoices, dock receipts, production sheets, and bills of lading.
            </p>
            <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E8EDE6] text-xs space-y-2">
              <h4 className="font-semibold text-[#173D32] flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#527D68]" />
                Zero Hallucinated Citations Principle:
              </h4>
              <p className="text-[#66746F] leading-relaxed">
                For every extracted lot code, quantity, and timestamp, BatchTrace records exact source coordinates: Document ID, page number, row index, original extracted text, and normalized value. If a citation cannot be pointed to an actual byte or row in storage, it is marked invalid.
              </p>
            </div>
          </section>

          {/* Section 2: Deterministic Graph Engine */}
          <section className="bg-white p-8 rounded-2xl border border-[#E2E6DF] shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F3ED] text-[#173D32] flex items-center justify-center font-bold">
                02
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#173D32]">Deterministic Graph Traversal &amp; Quantity Reconciliation</h2>
                <span className="text-xs text-[#66746F]">PostgreSQL Foreign Keys, Join Tables, and Certainty Levels</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#27343A] leading-relaxed mb-4">
              Traceability is not entrusted to an LLM prompt. Traversal logic executes in typed TypeScript and PostgreSQL relational queries across Suppliers &rarr; Ingredient Lots &rarr; Production Batches &rarr; Finished Lots &rarr; Customer Orders.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E8EDE6]">
                <h4 className="font-bold text-[#173D32] mb-1 flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-[#527D68]" />
                  Certainty Classification:
                </h4>
                <ul className="space-y-1 text-[#66746F]">
                  <li>&bull; <strong className="text-[#173D32]">Confirmed:</strong> Backed by approved documents and validated joins.</li>
                  <li>&bull; <strong className="text-[#B8710E]">Possible:</strong> Pending review (e.g. unreviewed batch sheet) or matching rule.</li>
                  <li>&bull; <strong className="text-slate-600">Unknown:</strong> Missing data explicitly highlighted.</li>
                </ul>
              </div>

              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E8EDE6]">
                <h4 className="font-bold text-[#173D32] mb-1 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#527D68]" />
                  Quantity Reconciliation:
                </h4>
                <p className="text-[#66746F] leading-relaxed">
                  Compares received ingredient mass against cumulative batch usage. Automatically flags variances (such as the 50 kg overage on Lot L-204) without silently coercing numbers.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Controlled Open-Weight AI Agent */}
          <section className="bg-white p-8 rounded-2xl border border-[#E2E6DF] shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F3ED] text-[#173D32] flex items-center justify-center font-bold">
                03
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#173D32]">Controlled AI Agent &amp; Open-Weight Inference</h2>
                <span className="text-xs text-[#66746F]">Qwen3-4B / Local Ollama Adapter with Tool Calling</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#27343A] leading-relaxed mb-4">
              The AI model is sandboxed behind server-side typed tools (`trace_ingredient_lot`, `check_quantity_discrepancies`, `get_source_evidence`). It has zero direct SQL execution, no arbitrary file system permissions, and cannot fabricate business entities.
            </p>
            <div className="p-4 bg-[#F7F6F0] rounded-xl border border-[#E2E6DF] font-mono text-[11px] text-[#27343A] space-y-1">
              <span className="text-[#527D68] block font-bold font-sans">Controlled Tool Sequence:</span>
              <p>&gt; Understand Query: &quot;Which batches used lot L-204?&quot;</p>
              <p>&gt; Call Tool: get_ingredient_lot(lotId=&quot;L-204&quot;)</p>
              <p>&gt; Call Tool: trace_ingredient_lot(lotId=&quot;L-204&quot;, direction=&quot;FORWARD&quot;)</p>
              <p>&gt; Ground Explanation in Verified DB Records</p>
              <p>&gt; Output Evidence Chips &amp; Request Human Sign-off</p>
            </div>
          </section>

          {/* Section 4: Human Review & Incident Reports */}
          <section className="bg-white p-8 rounded-2xl border border-[#E2E6DF] shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F3ED] text-[#173D32] flex items-center justify-center font-bold">
                04
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#173D32]">Human Decision-Support &amp; Audit Trail</h2>
                <span className="text-xs text-[#66746F]">Formal Incident Generation with Sign-off Controls</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#27343A] leading-relaxed mb-4">
              BatchTrace is decision-support software. It prepares formal incident reports with affected batches, retail destination addresses, and discrepancy breakdowns, but requires an authorized QA manager to approve next actions.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors shadow-xs"
              >
                <span>Try the Live Operations Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
