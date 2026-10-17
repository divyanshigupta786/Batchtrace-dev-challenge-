'use client';

import React from 'react';
import { CertaintyLevel } from '@/types/traceability';
import { ShieldCheck, AlertTriangle, HelpCircle, CheckCircle2, Clock, XCircle, AlertOctagon } from 'lucide-react';

interface StatusBadgeProps {
  status?: string;
  certainty?: CertaintyLevel;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, certainty, severity, size = 'md' }: StatusBadgeProps) {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (certainty) {
    switch (certainty) {
      case 'CONFIRMED':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#E8F3ED] text-[#173D32] border border-[#C6DEC6] ${pad}`}>
            <ShieldCheck className="w-3.5 h-3.5 text-[#173D32]" />
            Confirmed Record
          </span>
        );
      case 'POSSIBLE':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#FFF3DB] text-[#B8710E] border border-[#F5DC9C] ${pad}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-[#E9A23B]" />
            Possible Link
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB] ${pad}`}>
            <HelpCircle className="w-3.5 h-3.5 text-[#9CA3AF]" />
            Unknown / Unverified
          </span>
        );
    }
  }

  if (severity) {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#FCE9E7] text-[#B94343] border border-[#F5C2BE] ${pad}`}>
            <AlertOctagon className="w-3.5 h-3.5 text-[#B94343]" />
            Critical Risk
          </span>
        );
      case 'HIGH':
        return (
          <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#FCE9E7] text-[#B94343] border border-[#F5C2BE] ${pad}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-[#B94343]" />
            High Priority
          </span>
        );
      case 'MEDIUM':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#FFF3DB] text-[#B8710E] border border-[#F5DC9C] ${pad}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-[#E9A23B]" />
            Medium Priority
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#EBF3FB] text-[#2B6082] border border-[#CCE2F5] ${pad}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#477C9B]" />
            Low Priority
          </span>
        );
    }
  }

  const s = status?.toUpperCase() || '';
  if (['ACTIVE', 'APPROVED', 'DELIVERED', 'COMPLETED', 'RELEASED', 'VALID'].includes(s)) {
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-[#E8F3ED] text-[#173D32] border border-[#C6DEC6] ${pad}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-[#173D32]" />
        {status}
      </span>
    );
  }

  if (['FLAGGED', 'QUARANTINED', 'HOLD', 'RECALLED', 'REJECTED'].includes(s)) {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#FCE9E7] text-[#B94343] border border-[#F5C2BE] ${pad}`}>
        <XCircle className="w-3.5 h-3.5 text-[#B94343]" />
        {status}
      </span>
    );
  }

  if (['REVIEW_REQUIRED', 'NEEDS_REVIEW', 'READY_FOR_APPROVAL', 'WARNING', 'INVESTIGATING', 'PROCESSING'].includes(s)) {
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-[#FFF3DB] text-[#B8710E] border border-[#F5DC9C] ${pad}`}>
        <Clock className="w-3.5 h-3.5 text-[#E9A23B]" />
        {status?.replace(/_/g, ' ')}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${pad}`}>
      {status}
    </span>
  );
}
