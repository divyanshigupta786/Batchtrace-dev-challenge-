'use client';

import React, { useState } from 'react';
import { SourceEvidence } from '@/types/traceability';
import { FileText, ExternalLink, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface EvidenceChipProps {
  evidence: SourceEvidence;
}

export function EvidenceChip({ evidence }: EvidenceChipProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-[#E2E6DF] text-[#27343A] hover:bg-[#F7F6F0] hover:border-[#CBD5CB] transition-colors shadow-xs"
      >
        <FileText className="w-3.5 h-3.5 text-[#527D68]" />
        <span className="truncate max-w-[170px]">{evidence.documentName}</span>
        <span className="text-[10px] text-[#66746F] bg-[#F1F4EE] px-1 rounded font-mono">{evidence.rowOrPage}</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-1.5 w-80 p-3.5 bg-white rounded-xl shadow-lg border border-[#E2E6DF] z-50 text-xs text-[#27343A]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0F2ED]">
            <span className="font-semibold text-[#173D32] flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#173D32]" />
              Verified Provenance
            </span>
            <Link
              href={`/app/documents/${evidence.documentId}`}
              className="text-[#527D68] hover:text-[#173D32] flex items-center gap-1 font-medium"
            >
              View Document <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            <div>
              <span className="text-[#66746F] block text-[11px]">Document Source:</span>
              <p className="font-medium text-[#27343A]">{evidence.documentName}</p>
            </div>
            <div>
              <span className="text-[#66746F] block text-[11px]">Exact Coordinate:</span>
              <p className="font-mono text-[11px] text-[#173D32]">{evidence.rowOrPage}</p>
            </div>
            <div>
              <span className="text-[#66746F] block text-[11px]">Original Text Extracted:</span>
              <p className="font-mono text-[11px] bg-[#F7F6F0] p-1.5 rounded border border-[#E8EDE6] text-slate-800 break-words">
                &quot;{evidence.extractedText}&quot;
              </p>
            </div>
            <div>
              <span className="text-[#66746F] block text-[11px]">Verified Value:</span>
              <p className="font-semibold text-[#173D32]">{evidence.verifiedValue}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
