'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-[#102C25] text-[#DCE8DF] border-t border-[#173D32] py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#173D32] flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-[#DCE8DF]" />
            </div>
            <span className="font-bold text-white text-base">BatchTrace Agent</span>
          </div>
          <p className="text-xs text-[#A5C2B4] leading-relaxed">
            Every batch has a story. Find it instantly. Explainable food supply chain intelligence, deterministic tracing, and AI-assisted investigation.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9A23B] mb-3">Product</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/app" className="hover:text-white transition-colors">Operations Dashboard</Link></li>
            <li><Link href="/app/trace" className="hover:text-white transition-colors">Traceability Explorer</Link></li>
            <li><Link href="/app/documents" className="hover:text-white transition-colors">Document Review Inbox</Link></li>
            <li><Link href="/app/agent" className="hover:text-white transition-colors">AI Investigation Workspace</Link></li>
            <li><Link href="/app/incidents" className="hover:text-white transition-colors">Incident Intelligence Reports</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9A23B] mb-3">Architecture &amp; Docs</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            <li><Link href="/security" className="hover:text-white transition-colors">Security &amp; Tenant Isolation</Link></li>
            <li><Link href="/docs/product-guide.md" className="hover:text-white transition-colors">Product Guide (Markdown)</Link></li>
            <li><Link href="/llms.txt" className="hover:text-white transition-colors">llms.txt Specification</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9A23B] mb-3">Governance &amp; Trust</h4>
          <p className="text-xs text-[#A5C2B4] leading-relaxed mb-2">
            Decision-support software grounded in PostgreSQL and human sign-off. Not an autonomous recall authority.
          </p>
          <div className="text-[11px] text-[#A5C2B4] font-mono bg-[#173D32] p-2 rounded border border-[#527D68]/30">
            FSMA 204 Ready Data Architecture
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-[#173D32] flex flex-wrap items-center justify-between gap-4 text-xs text-[#A5C2B4]">
        <p>&copy; 2026 BatchTrace Agent. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/security" className="hover:underline">Security Notice</Link>
          <span>&bull;</span>
          <Link href="/docs/product-guide.md" className="hover:underline">Documentation</Link>
        </div>
      </div>
    </footer>
  );
}
