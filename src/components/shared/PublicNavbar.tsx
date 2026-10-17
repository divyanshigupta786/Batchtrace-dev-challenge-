'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Network, Sparkles, BookOpen, Lock } from 'lucide-react';

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 bg-[#F7F6F0]/90 backdrop-blur-md border-b border-[#E2E6DF]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#173D32] flex items-center justify-center text-white font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#DCE8DF]" />
          </div>
          <span className="font-bold text-lg text-[#173D32] tracking-tight">BatchTrace Agent</span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#27343A]">
          <Link href="/how-it-works" className="hover:text-[#173D32] transition-colors flex items-center gap-1">
            <Network className="w-3.5 h-3.5 text-[#527D68]" />
            How It Works
          </Link>
          <Link href="/security" className="hover:text-[#173D32] transition-colors flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-[#527D68]" />
            Security &amp; Provenance
          </Link>
          <Link href="/docs/product-guide.md" className="hover:text-[#173D32] transition-colors flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#527D68]" />
            Product Guide
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-[#27343A] hover:text-[#173D32] px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors shadow-xs"
          >
            <span>Live MVP App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
