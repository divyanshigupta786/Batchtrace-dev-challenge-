'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/shared/AppHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { traceStore } from '@/lib/store/traceStore';
import { IncidentReport } from '@/types/traceability';
import { 
  AlertOctagon, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ArrowRight,
  ShieldAlert,
  FileText
} from 'lucide-react';

export default function IncidentsListPage() {
  const [incidents, setIncidents] = useState<IncidentReport[]>(traceStore.incidents);
  const [filter, setFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('L-204');
  const [newSeverity, setNewSeverity] = useState<IncidentReport['severity']>('HIGH');
  const [newDesc, setNewDesc] = useState('');

  const filtered = incidents.filter(i => {
    if (filter === 'ACTIVE') return i.status !== 'CLOSED';
    if (filter === 'APPROVED') return i.status === 'APPROVED';
    return true;
  });

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;

    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        targetLotOrBatch: newTarget,
        severity: newSeverity,
        description: newDesc,
        investigatorName: 'Elena Rostova (QA Manager)',
      }),
    });
    const data = await res.json();
    if (data.success) {
      setIncidents([...traceStore.incidents]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Incident intelligence &amp; reports"
        description="Formal food safety investigation dossiers with grounded affected customer lists and approval governance."
      />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Control Strip */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E6DF] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#66746F]">Filter Status:</span>
            <div className="flex items-center gap-1">
              {['ALL', 'ACTIVE', 'APPROVED'].map((f) => (
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
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B94343] text-white hover:bg-red-800 font-semibold text-xs transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start New Investigation</span>
          </button>
        </div>

        {/* Incidents Table */}
        <div className="bg-white rounded-2xl border border-[#E2E6DF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E2E6DF] text-[#66746F]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Incident Dossier</th>
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold">Severity</th>
                  <th className="py-3 px-4 font-semibold">Affected Batches</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Lead Investigator</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2ED]">
                {filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-medium">
                      <div>
                        <span className="block font-bold text-[#173D32] text-xs">{inc.title}</span>
                        <span className="text-[10px] text-[#66746F] font-mono">
                          {inc.incidentNumber} &bull; Created {inc.createdAt}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="bg-[#E8F3ED] text-[#173D32] px-2 py-0.5 rounded font-bold">
                        {inc.targetLotOrBatch}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge severity={inc.severity} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#27343A]">
                      {inc.confirmedBatches.length > 0 ? inc.confirmedBatches.join(', ') : 'Pending Trace'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="py-3.5 px-4 text-[#27343A] font-medium">{inc.investigatorName}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/app/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-[#173D32] hover:bg-[#F7F6F0] px-2.5 py-1 rounded-md"
                      >
                        <span>Open Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* New Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E6DF] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2ED]">
              <h3 className="text-base font-bold text-[#173D32] flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-[#B94343]" />
                <span>Initialize Incident Investigation</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#27343A] mb-1">Investigation Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Supplier Notification: DON Mycotoxin Elevation in Oat Lot L-204"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E6DF] text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#27343A] mb-1">Target Lot or Batch ID</label>
                  <input
                    type="text"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E6DF] font-mono text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#27343A] mb-1">Severity Level</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E6DF] text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#27343A] mb-1">Incident Scope Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the initial supplier advisory, contamination flag, or customer complaint..."
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E6DF] text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#E2E6DF] text-xs font-medium text-[#66746F] hover:bg-[#F7F6F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#B94343] text-white hover:bg-red-800 font-semibold text-xs transition-colors shadow-xs"
                >
                  Create &amp; Record in Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
