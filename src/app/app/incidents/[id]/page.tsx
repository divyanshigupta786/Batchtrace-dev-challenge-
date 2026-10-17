'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/shared/AppHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EvidenceChip } from '@/components/shared/EvidenceChip';
import { traceStore } from '@/lib/store/traceStore';
import { IncidentReport, IncidentStatus } from '@/types/traceability';
import { 
  AlertOctagon, 
  ArrowLeft, 
  CheckCircle2, 
  Printer, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Scale, 
  CheckSquare,
  UserCheck
} from 'lucide-react';
import { DEMO_ORG_NAME } from '@/lib/data/syntheticData';

function IncidentDossierInner() {
  const params = useParams();
  const incidentId = (params?.id as string) || '';

  const [incident, setIncident] = useState<IncidentReport | null>(null);
  const [signOffNotes, setSignOffNotes] = useState('');
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    const inc = traceStore.incidents.find(i => i.id === incidentId || i.incidentNumber === incidentId);
    if (inc) {
      setIncident({ ...inc });
    }
  }, [incidentId]);

  if (!incident) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <div className="bg-white p-8 rounded-2xl border border-[#E2E6DF] text-center max-w-lg mx-auto my-12">
          <AlertOctagon className="w-12 h-12 text-[#B94343] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#173D32]">Incident Dossier Not Found</h2>
          <p className="text-xs text-[#66746F] mb-4">Could not locate record &quot;{incidentId}&quot;.</p>
          <Link href="/app/incidents" className="px-4 py-2 rounded-lg bg-[#173D32] text-white text-xs font-semibold">
            Return to Incidents
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    setIsAdvancing(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actorName: 'Elena Rostova (QA Manager)',
          notes: signOffNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIncident(data.data);
      }
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col print:bg-white print:p-0">
      <div className="print:hidden">
        <AppHeader
          title={`Incident Report ${incident.incidentNumber}`}
          description="Evidence-backed food safety investigation and containment dossier."
        />
      </div>

      <main className="p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Top Action Bar (Hidden on Print) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/app/incidents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#527D68] hover:text-[#173D32]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Incidents</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg border border-[#E2E6DF] bg-white hover:bg-[#F7F6F0] font-semibold text-xs text-[#27343A] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#527D68]" />
              <span>Print / Export PDF</span>
            </button>

            {incident.status !== 'APPROVED' && (
              <button
                type="button"
                onClick={() => handleStatusChange('APPROVED')}
                disabled={isAdvancing}
                className="px-4 py-1.5 rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E9A23B]" />
                <span>{isAdvancing ? 'Saving...' : 'Formally Approve Dossier'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Printable Formal Dossier Container */}
        <div className="bg-white rounded-2xl border border-[#E2E6DF] shadow-md p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Dossier Header */}
          <div className="border-b-2 border-[#173D32] pb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg text-[#173D32] tracking-tight">{DEMO_ORG_NAME}</span>
                <span className="text-xs bg-[#E8F3ED] text-[#173D32] px-2 py-0.5 rounded font-mono font-semibold">
                  QA Department
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#173D32] tracking-tight">{incident.title}</h1>
              <p className="text-xs text-[#66746F] mt-1">
                Investigation Lead: <strong>{incident.investigatorName}</strong> &bull; Generated: {incident.createdAt}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-base font-black font-mono text-[#173D32]">{incident.incidentNumber}</span>
              <div className="flex items-center gap-2">
                <StatusBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
              </div>
            </div>
          </div>

          {/* Section 1: Target Entity & Description */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#527D68] flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-[#B94343]" />
              <span>1. Target Entity &amp; Incident Scope</span>
            </h3>

            <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E8EDE6] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#66746F] block text-[11px]">Target Identifier:</span>
                <span className="font-mono font-bold text-sm text-[#173D32]">{incident.targetLotOrBatch}</span>
              </div>
              <div>
                <span className="text-[#66746F] block text-[11px]">Entity Category:</span>
                <span className="font-semibold text-[#27343A]">{incident.targetType}</span>
              </div>
              <div>
                <span className="text-[#66746F] block text-[11px]">Primary Risk Level:</span>
                <span className="font-bold text-[#B94343]">{incident.severity}</span>
              </div>
            </div>

            <p className="text-xs text-[#27343A] leading-relaxed bg-white p-3 rounded-lg border border-[#E2E6DF]">
              {incident.description}
            </p>
          </section>

          {/* Section 2: Downstream Production Batches & Orders */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#527D68] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#173D32]" />
              <span>2. Confirmed Affected Entities (Deterministic Trace)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-[#E2E6DF] bg-white space-y-2">
                <span className="font-bold text-[#173D32] block">Confirmed Production Batches ({incident.confirmedBatches.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {incident.confirmedBatches.map(b => (
                    <span key={b} className="font-mono font-bold px-2 py-1 rounded bg-[#E8F3ED] text-[#173D32] border border-[#C6DEC6]">
                      {b}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#66746F]">Batches that consumed target raw material on Line 1 &amp; Line 3.</p>
              </div>

              <div className="p-4 rounded-xl border border-[#E2E6DF] bg-white space-y-2">
                <span className="font-bold text-[#173D32] block">Affected Customer Dispatches ({incident.confirmedOrders.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {incident.confirmedOrders.map(o => (
                    <span key={o} className="font-mono font-bold px-2 py-1 rounded bg-[#E8F3ED] text-[#173D32] border border-[#C6DEC6]">
                      {o}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#66746F]">Whole Foods Market, FreshDirect, Trader Joe&apos;s, Apex Regional.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Mass Balance & Quantity Reconciliation */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#527D68] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#E9A23B]" />
              <span>3. Mass Balance Discrepancy &amp; Data Anomalies</span>
            </h3>

            <div className="p-4 rounded-xl bg-[#FFF3DB]/70 border border-[#F5DC9C] text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-[#B8710E]">
                <span>Over-Consumption Variance Flagged on Lot L-204</span>
                <span className="font-mono text-red-700">-50.00 kg</span>
              </div>
              <p className="text-[#66746F] leading-snug">
                Initial receiving record <strong>DOC-801</strong> logged receipt of <strong>1,200 kg</strong>. 
                However, recorded batch consumption totaled <strong>1,250 kg</strong> (PB-031 used 800 kg + PB-032 used 450 kg). 
                Requires verification with receiving dock scales before closing.
              </p>
            </div>
          </section>

          {/* Section 4: Supporting Evidence Provenance */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#527D68] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#527D68]" />
              <span>4. Source Document Citations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {incident.evidenceItems.map((ev, i) => (
                <div key={i} className="p-3 rounded-lg border border-[#E2E6DF] bg-[#FAF9F5] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#173D32] truncate max-w-[200px]">{ev.documentName}</span>
                    <span className="font-mono text-[10px] text-[#66746F]">{ev.rowOrPage}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 italic">&quot;{ev.extractedText}&quot;</p>
                  <p className="text-[11px] font-semibold text-[#173D32]">{ev.verifiedValue}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Recommended Action Steps & Limitations */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-[#173D32] uppercase tracking-wider text-[11px]">
                Recommended Quality Containment Steps:
              </h4>
              <ul className="space-y-1.5 text-[#27343A]">
                {incident.recommendedSteps.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-[#527D68] shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-[#173D32] uppercase tracking-wider text-[11px]">
                Limitations &amp; Unresolved Variables:
              </h4>
              <ul className="space-y-1.5 text-[#66746F]">
                {incident.limitations.map((l, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">&bull;</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 6: Human Approval & Sign-Off Block */}
          <section className="pt-6 border-t-2 border-[#173D32] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#173D32] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#173D32]" />
                <span>5. Human Authority Sign-Off &amp; Audit Seal</span>
              </h3>

              {incident.status === 'APPROVED' ? (
                <span className="px-3 py-1 rounded-full bg-[#E8F3ED] text-[#173D32] font-bold text-xs border border-[#C6DEC6] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#173D32]" />
                  Formally Approved &amp; Locked
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#FFF3DB] text-[#B8710E] font-bold text-xs border border-[#F5DC9C]">
                  Pending Final Sign-Off
                </span>
              )}
            </div>

            <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E8EDE6] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#66746F] block text-[11px]">Authorized Reviewer:</span>
                <span className="font-bold text-[#173D32]">
                  {incident.approvedBy || 'Elena Rostova (QA Manager)'}
                </span>
              </div>
              <div>
                <span className="text-[#66746F] block text-[11px]">Approval Timestamp:</span>
                <span className="font-mono text-[#27343A]">
                  {incident.approvedAt || 'Awaiting sign-off action'}
                </span>
              </div>
            </div>

            {incident.status !== 'APPROVED' && (
              <div className="print:hidden space-y-3 pt-2">
                <label className="block text-xs font-semibold text-[#27343A]">Sign-Off Notes / Containment Orders:</label>
                <textarea
                  rows={2}
                  value={signOffNotes}
                  onChange={(e) => setSignOffNotes(e.target.value)}
                  placeholder="Enter QA verification notes before locking this report..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E6DF] text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                />
                <button
                  type="button"
                  onClick={() => handleStatusChange('APPROVED')}
                  disabled={isAdvancing}
                  className="px-5 py-2.5 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors shadow-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#E9A23B]" />
                  <span>Execute QA Sign-Off &amp; Commit to Audit Log</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function IncidentDossierPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 text-xs text-[#527D68]">
        Loading Incident Dossier...
      </div>
    }>
      <IncidentDossierInner />
    </Suspense>
  );
}
