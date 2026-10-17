'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Lock, User, Building2, CheckCircle } from 'lucide-react';
import { DEMO_ORG_NAME } from '@/lib/data/syntheticData';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('elena.rostova@meadowpantry.example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/app');
    }, 400);
  };

  const handleQuickDemoRole = (roleEmail: string) => {
    setEmail(roleEmail);
    setLoading(true);
    setTimeout(() => {
      router.push('/app');
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F7F6F0] p-6">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#173D32] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#DCE8DF]" />
            </div>
            <span className="font-bold text-2xl text-[#173D32] tracking-tight">BatchTrace Agent</span>
          </Link>
          <p className="text-xs text-[#66746F]">Every batch has a story. Find it instantly.</p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl border border-[#E2E6DF] shadow-md space-y-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#527D68] font-semibold mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{DEMO_ORG_NAME}</span>
            </div>
            <h2 className="text-xl font-bold text-[#173D32]">Sign in to your organization</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#27343A] mb-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E6DF] text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-[#27343A]">Password</label>
                <span className="text-[11px] text-[#527D68] hover:underline cursor-pointer">Forgot?</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E6DF] text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="pt-4 border-t border-[#E2E6DF]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66746F] block mb-2.5">
              Instant Demo Access Roles:
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemoRole('elena.rostova@meadowpantry.example.com')}
                className="w-full text-left p-2.5 rounded-lg border border-[#E2E6DF] hover:border-[#173D32] hover:bg-[#FAF9F5] transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-[#173D32]">Elena Rostova (QA Manager)</p>
                  <p className="text-[10px] text-[#66746F]">Full investigation, report generation &amp; approval rights</p>
                </div>
                <span className="text-[10px] bg-[#E8F3ED] text-[#173D32] font-semibold px-2 py-0.5 rounded">
                  Demo
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoRole('marcus.vance@meadowpantry.example.com')}
                className="w-full text-left p-2.5 rounded-lg border border-[#E2E6DF] hover:border-[#173D32] hover:bg-[#FAF9F5] transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-[#173D32]">Marcus Vance (Production Supervisor)</p>
                  <p className="text-[10px] text-[#66746F]">Batch execution sheets &amp; floor traveler data</p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                  Demo
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#66746F]">
          <span>Don&apos;t have an organization account? </span>
          <Link href="/signup" className="text-[#173D32] font-semibold hover:underline">
            Register new tenant
          </Link>
        </div>
      </div>
    </div>
  );
}
