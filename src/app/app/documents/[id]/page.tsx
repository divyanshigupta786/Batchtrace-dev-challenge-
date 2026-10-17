'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/shared/AppHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { traceStore } from '@/lib/store/traceStore';
import { DocumentRecord, ExtractedFieldRecord } from '@/types/traceability';
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Save, 
  FileSpreadsheet,
  Cpu,
  Clock
} from 'lucide-react';

function DocumentReviewInner() {
  const params = useParams();
  const router = useRouter();
  const docId = (params?.id as string) || '';

  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [fields, setFields] = useState<ExtractedFieldRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const doc = traceStore.documents.find(d => d.id === docId);
    if (doc) {
      setDocument(doc);
      setFields([...doc.extractedRecords]);
    }
  }, [docId]);

  if (!document) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <div className="bg-white p-8 rounded-2xl border border-[#E2E6DF] text-center max-w-lg mx-auto my-12">
          <FileText className="w-12 h-12 text-[#527D68] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#173D32]">Document Not Found</h2>
          <p className="text-xs text-[#66746F] mb-4">The requested document &quot;{docId}&quot; could not be located.</p>
          <Link
            href="/app/documents"
            className="px-4 py-2 rounded-lg bg-[#173D32] text-white text-xs font-semibold"
          >
            Return to Inbox
          </Link>
        </div>
      </div>
    );
  }

  const handleFieldChange = (index: number, newNormalizedValue: string) => {
    const updated = [...fields];
    updated[index].normalizedValue = newNormalizedValue;
    setFields(updated);
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/documents/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          action: 'APPROVE',
          reviewerName: 'Elena Rostova (QA Manager)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDocument(data.data);
        setMessage({ type: 'success', text: 'Document approved! Business relationships verified and committed to trace graph.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Approval failed' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/documents/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          action: 'REJECT',
          reviewerName: 'Elena Rostova (QA Manager)',
          reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDocument(data.data);
        setMessage({ type: 'success', text: `Document marked REJECTED: ${reason}` });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title={`Review: ${document.filename}`}
        description={`Document ID: ${document.id} • Category: ${document.category}`}
      />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/app/documents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#527D68] hover:text-[#173D32]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Document Inbox</span>
          </Link>

          <div className="flex items-center gap-3">
            <StatusBadge status={document.status} />

            {document.status === 'REVIEW_REQUIRED' && (
              <>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg border border-[#F5C2BE] text-[#B94343] hover:bg-[#FCE9E7] font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E9A23B]" />
                  <span>{isSubmitting ? 'Approving...' : 'Approve & Confirm Records'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-[#E8F3ED] text-[#173D32] border-[#C6DEC6]' 
              : 'bg-[#FCE9E7] text-[#B94343] border-[#F5C2BE]'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Side-by-Side Review Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel (5 cols): Raw Source Document Preview */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E6DF] shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 bg-[#FAF9F5] border-b border-[#E2E6DF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#527D68]" />
                <h3 className="text-xs font-bold text-[#173D32]">Source Document Raw Content</h3>
              </div>
              <span className="text-[10px] font-mono text-[#66746F]">
                {document.fileType} Format
              </span>
            </div>

            <div className="p-4 bg-[#102C25] text-[#DCE8DF] font-mono text-xs overflow-x-auto min-h-[460px] max-h-[600px] leading-relaxed">
              <pre className="whitespace-pre-wrap">{document.rawTextPreview || 'No raw preview available.'}</pre>
            </div>

            <div className="p-3 bg-[#FAF9F5] border-t border-[#E2E6DF] text-[11px] text-[#66746F]">
              Uploaded by <strong>{document.uploaderName}</strong> on {document.uploadedAt}
            </div>
          </div>

          {/* Right Panel (7 cols): Structured Extraction Fields & Provenance */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E6DF] shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 bg-[#FAF9F5] border-b border-[#E2E6DF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#173D32]" />
                <h3 className="text-xs font-bold text-[#173D32]">Extracted Fields &amp; Provenance Coordinates</h3>
              </div>
              <span className="text-xs text-[#66746F]">{fields.length} candidate fields</span>
            </div>

            <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto divide-y divide-[#F0F2ED]">
              {fields.map((field, idx) => (
                <div key={field.id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#173D32] flex items-center gap-1.5">
                      <span className="font-mono text-[11px] bg-[#E8F3ED] px-1.5 py-0.5 rounded text-[#173D32]">
                        {field.fieldName}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#66746F] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E8EDE6]">
                        {field.sourceLocation.page ? `Page ${field.sourceLocation.page}` : `Row ${field.sourceLocation.row}`}
                        {field.sourceLocation.column && ` : Col ${field.sourceLocation.column}`}
                      </span>
                      <span className="text-[10px] font-semibold text-[#527D68]">
                        {(field.confidence * 100).toFixed(0)}% conf
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-[#66746F] block mb-1">Original Text:</span>
                      <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8EDE6] font-mono text-[11px] text-[#27343A] break-words">
                        {field.originalText}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#66746F] block mb-1 font-semibold">Normalized Value:</span>
                      <input
                        type="text"
                        value={String(field.normalizedValue)}
                        onChange={(e) => handleFieldChange(idx, e.target.value)}
                        disabled={document.status === 'APPROVED'}
                        className="w-full px-3 py-2 rounded-lg border border-[#E2E6DF] font-mono text-xs text-[#173D32] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32] disabled:bg-[#FAF9F5]"
                      />
                    </div>
                  </div>

                  {field.validationMessage && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{field.validationMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#66746F] pt-1">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-[#527D68]" />
                      Method: {field.extractionMethod}
                    </span>
                    <span>
                      {field.reviewed ? `Verified by ${field.reviewedBy}` : 'Pending QA Signature'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#FAF9F5] border-t border-[#E2E6DF] flex items-center justify-between">
              <span className="text-xs text-[#66746F]">
                Changes made here persist to the organization graph upon approval.
              </span>
              {document.status === 'REVIEW_REQUIRED' && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors shadow-xs"
                >
                  Confirm &amp; Approve Extractions
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DocumentReviewPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 text-xs text-[#527D68]">
        Loading Document Review Workspace...
      </div>
    }>
      <DocumentReviewInner />
    </Suspense>
  );
}
