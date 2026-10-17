'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Building2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState('Meadow Pantry Products Inc.');
  const [name, setName] = useState('Elena Rostova');
  const [email, setEmail] = useState('elena.rostova@meadowpantry.example.com');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/app');
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F7F6F0] p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#173D32] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#DCE8DF]" />
            </div>
            <span className="font-bold text-2xl text-[#173D32] tracking-tight">BatchTrace Agent</span>
          </Link>
          <p className="text-xs text-[#66746F]">Register your food processing or packaging organization</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-[#E2E6DF] shadow-md space-y-5">
          <h2 className="text-xl font-bold text-[#173D32]">Create Organization Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#27343A] mb-1">Company / Facility Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E6DF] text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#27343A] mb-1">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E6DF] text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
              />
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Setting up tenant...' : 'Create Workspace &amp; Load Demo'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-[#66746F]">
          <span>Already registered? </span>
          <Link href="/login" className="text-[#173D32] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
