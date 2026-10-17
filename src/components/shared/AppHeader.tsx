'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Cpu, 
  Search, 
  User, 
  ShieldCheck, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DEMO_ORG_NAME } from '@/lib/data/syntheticData';

interface AppHeaderProps {
  title?: string;
  description?: string;
  onResetDemo?: () => void;
}

export function AppHeader({ title, description, onResetDemo }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#F7F6F0]/90 backdrop-blur-md border-b border-[#E2E6DF] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#66746F] mb-0.5">
          <span className="flex items-center gap-1 font-medium text-[#173D32]">
            <Building2 className="w-3.5 h-3.5 text-[#527D68]" />
            {DEMO_ORG_NAME}
          </span>
          <span>/</span>
          <span>Operations & Traceability</span>
        </div>
        {title && <h1 className="text-xl font-bold text-[#27343A] tracking-tight">{title}</h1>}
        {description && <p className="text-xs text-[#66746F] mt-0.5">{description}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* AI Provider Status Indicator */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-[#E2E6DF] shadow-2xs"
          title="AI Inference Status: Controlled Tool Calling with Grounded Provenance"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#27343A] font-medium flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#527D68]" />
            Qwen3-4B / Local Engine
          </span>
          <span className="text-[10px] bg-[#E8F3ED] text-[#173D32] px-1.5 py-0.2 rounded font-mono">Ready</span>
        </div>

        {/* Reset Demo State Button */}
        {onResetDemo && (
          <button
            type="button"
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#66746F] hover:text-[#173D32] hover:bg-white border border-transparent hover:border-[#E2E6DF] transition-colors"
            title="Reset dataset back to default synthetic records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>
        )}

        {/* Quick Trace CTA */}
        <Link
          href="/app/trace"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] transition-colors shadow-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Trace Lot L-204</span>
        </Link>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E2E6DF]">
          <div className="w-8 h-8 rounded-full bg-[#DCE8DF] flex items-center justify-center text-[#173D32] font-semibold text-xs border border-[#CBD5CB]">
            ER
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-semibold text-[#27343A] leading-tight">Elena Rostova</p>
            <p className="text-[11px] text-[#66746F]">QA Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
