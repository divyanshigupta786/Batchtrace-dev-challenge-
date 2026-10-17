'use client';

import React, { useState } from 'react';
import { AppHeader } from '@/components/shared/AppHeader';
import { traceStore } from '@/lib/store/traceStore';
import { AuditLogEntry } from '@/types/traceability';
import { 
  History, 
  ShieldCheck, 
  User, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Search
} from 'lucide-react';

export default function AuditTrailPage() {
  const [logs] = useState<AuditLogEntry[]>(traceStore.auditLogs);
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(l => 
    l.summary.toLowerCase().includes(search.toLowerCase()) ||
    l.actor.name.toLowerCase().includes(search.toLowerCase()) ||
    l.targetEntityId.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Immutable audit trail"
        description="Tamper-evident system log of every document approval, trace execution, and incident status transition."
      />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Search & Info Banner */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E6DF] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-[#527D68] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by actor, entity ID (L-204, DOC-805), or action..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E2E6DF] text-xs text-[#27343A] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#66746F]">
            <ShieldCheck className="w-4 h-4 text-[#173D32]" />
            <span>Cryptographic append-only sequence</span>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-[#E2E6DF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E2E6DF] text-[#66746F]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Actor / Authority</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold">Event Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2ED]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#66746F] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-[#173D32] block">{log.actor.name}</span>
                        <span className="text-[10px] text-[#66746F] font-mono">{log.actor.role}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#F7F6F0] text-[#173D32] border border-[#E2E6DF]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="bg-[#E8F3ED] text-[#173D32] px-1.5 py-0.5 rounded font-bold text-[11px]">
                        {log.targetEntityId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#27343A] leading-snug">
                      <p className="max-w-xl">{log.summary}</p>
                      {log.diff && (
                        <div className="mt-1 text-[10px] font-mono text-[#66746F] bg-slate-50 p-1.5 rounded border border-slate-200">
                          Diff: {JSON.stringify(log.diff)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
