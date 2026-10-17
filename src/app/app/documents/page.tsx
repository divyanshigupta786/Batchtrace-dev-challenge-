'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/shared/AppHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { traceStore } from '@/lib/store/traceStore';
import { DocumentRecord } from '@/types/traceability';
import { 
  FileText, 
  Upload, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter,
  FileSpreadsheet,
  FileCode,
  ArrowRight
} from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>(traceStore.documents);
  const [filter, setFilter] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadFilename, setUploadFilename] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredDocs = documents.filter(d => {
    if (filter === 'REVIEW_REQUIRED') return d.status === 'REVIEW_REQUIRED';
    if (filter === 'APPROVED') return d.status === 'APPROVED';
    return true;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFilename || !uploadText) return;

    setIsUploading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadFilename,
          fileContent: uploadText,
          uploaderName: 'Elena Rostova (QA Manager)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDocuments([...traceStore.documents]);
        setShowUploadModal(false);
        setUploadText('');
        setUploadFilename('');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const loadSampleUpload = (type: 'COA' | 'BATCH' | 'BOL') => {
    if (type === 'COA') {
      setUploadFilename('Greenfield_COA_Lot_L-208_Oats.pdf');
      setUploadText(`GREENFIELD INGREDIENTS CO. - CERTIFICATE OF ANALYSIS
COA Ref: COA-2026-9912
Date of Analysis: 2026-10-12
Customer: Meadow Pantry Products Inc.
PO Reference: PO-88310

Item Description: Certified Organic Rolled Oats
Supplier Lot ID: L-208
Gross Qty: 800.00 KG (32 sacks x 25kg)
Moisture: 10.4% (Spec: <12%)
DON Mycotoxin: < 0.2 ppm (Spec: < 1.0 ppm PASS)
Gluten ELISA: < 5 ppm (Gluten-Free Certified PASS)
Status: APPROVED_FOR_RELEASE
Authorized Analyst: Dr. Katherine Bell`);
    } else if (type === 'BATCH') {
      setUploadFilename('Production_Batch_Sheet_PB-034.csv');
      setUploadText(`Batch_ID,Date,Line,Recipe,Supervisor,Lot_Consumed,Qty_Used,Unit,Finished_Lot,Yield_Pouches
PB-034,2026-10-14,Line 1,Honey Toasted Granola,Elena Rostova,L-205,300,kg,FP-104,1500`);
    } else if (type === 'BOL') {
      setUploadFilename('Shipping_BOL_Apex_ORD-113.txt');
      setUploadText(`APEX LOGISTICS BILL OF LADING
BOL No: BOL-APX-8801
Date: 2026-10-15
Shipper: Meadow Pantry Products Inc.
Consignee: Apex Regional Distributors, Boston MA
Order Number: ORD-113
Carrier: Apex Logistics Direct
Item: Finished Lot FP-103 | Dark Chocolate Cacao Granola | 400 Pouches
Status: SIGNED_AND_DELIVERED`);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Document inbox"
        description="Ingest and verify supplier invoices, receiving logs, batch production sheets, and dispatch manifests."
      />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E2E6DF] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#66746F]">Filter Status:</span>
            <div className="flex items-center gap-1">
              {['ALL', 'REVIEW_REQUIRED', 'APPROVED'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-[#173D32] text-white font-semibold'
                      : 'text-[#27343A] hover:bg-[#F7F6F0]'
                  }`}
                >
                  {f.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New Document</span>
          </button>
        </div>

        {/* Document Ingestion Table */}
        <div className="bg-white rounded-2xl border border-[#E2E6DF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E2E6DF] text-[#66746F]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Document Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Uploaded</th>
                  <th className="py-3 px-4 font-semibold">Uploader</th>
                  <th className="py-3 px-4 font-semibold">Extracted Records</th>
                  <th className="py-3 px-4 font-semibold">Review Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2ED]">
                {filteredDocs.map((doc) => {
                  const isPending = doc.status === 'REVIEW_REQUIRED';
                  return (
                    <tr key={doc.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#27343A]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#527D68]" />
                          <div>
                            <span className="block font-semibold text-[#173D32]">{doc.filename}</span>
                            <span className="text-[10px] text-[#66746F] font-mono">
                              {doc.id} &bull; {(doc.fileSizeBytes / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] bg-[#F7F6F0] px-2 py-0.5 rounded border border-[#E2E6DF]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#66746F]">{doc.uploadedAt}</td>
                      <td className="py-3.5 px-4 text-[#27343A] font-medium">{doc.uploaderName}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#173D32] bg-[#E8F3ED] px-2 py-0.5 rounded font-mono">
                          {doc.recordCount} fields
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/app/documents/${doc.id}`}
                          className={`inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-md transition-colors ${
                            isPending
                              ? 'bg-[#E9A23B] text-black hover:bg-amber-400 font-bold'
                              : 'text-[#173D32] hover:bg-[#F7F6F0]'
                          }`}
                        >
                          <span>{isPending ? 'Review & Approve' : 'Inspect'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E6DF] max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2ED]">
              <h3 className="text-base font-bold text-[#173D32]">Upload &amp; Ingest Supply Chain Record</h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            {/* Quick Demo Templates */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#66746F] block mb-1.5">
                Quick Ingest Template:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadSampleUpload('COA')}
                  className="px-2.5 py-1 rounded-md bg-[#FAF9F5] border border-[#E2E6DF] text-xs text-[#173D32] hover:bg-[#E8F3ED] font-medium"
                >
                  + Sample Supplier COA (Lot L-208)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleUpload('BATCH')}
                  className="px-2.5 py-1 rounded-md bg-[#FAF9F5] border border-[#E2E6DF] text-xs text-[#173D32] hover:bg-[#E8F3ED] font-medium"
                >
                  + Sample Batch Sheet CSV (PB-034)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleUpload('BOL')}
                  className="px-2.5 py-1 rounded-md bg-[#FAF9F5] border border-[#E2E6DF] text-xs text-[#173D32] hover:bg-[#E8F3ED] font-medium"
                >
                  + Sample Dispatch BOL (ORD-113)
                </button>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#27343A] mb-1">Filename</label>
                <input
                  type="text"
                  value={uploadFilename}
                  onChange={(e) => setUploadFilename(e.target.value)}
                  placeholder="e.g. Supplier_Invoice_INV-9041.pdf or Batch_032.csv"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E6DF] text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#27343A] mb-1">
                  Document Contents / Text / CSV Payload
                </label>
                <textarea
                  rows={6}
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder="Paste raw text, CSV rows, or invoice contents..."
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E6DF] font-mono text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#E2E6DF] text-xs font-medium text-[#66746F] hover:bg-[#F7F6F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors shadow-xs"
                >
                  {isUploading ? 'Extracting...' : 'Parse & Extract Fields'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
