'use client';

import React, { useState, useMemo } from 'react';
import { TraceResult, TraceNode, CertaintyLevel } from '@/types/traceability';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EvidenceChip } from '@/components/shared/EvidenceChip';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Building2,
  Box,
  Layers,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Info
} from 'lucide-react';

interface TraceGraphProps {
  traceResult: TraceResult;
  onSelectEntity?: (id: string) => void;
}

export function TraceGraph({ traceResult, onSelectEntity }: TraceGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(traceResult.rootEntity.id);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const selectedNode = useMemo(() => {
    return traceResult.nodes.find(n => n.id === selectedNodeId) || traceResult.rootEntity;
  }, [traceResult, selectedNodeId]);

  // Group nodes by columns for clean 2D operational layout
  const columns = useMemo(() => {
    const suppliers = traceResult.nodes.filter(n => n.type === 'SUPPLIER');
    const ingredientLots = traceResult.nodes.filter(n => n.type === 'INGREDIENT_LOT');
    const batches = traceResult.nodes.filter(n => n.type === 'PRODUCTION_BATCH');
    const finishedLots = traceResult.nodes.filter(n => n.type === 'FINISHED_LOT');
    const orders = traceResult.nodes.filter(n => n.type === 'CUSTOMER_ORDER');

    return [
      { title: '1. Suppliers', type: 'SUPPLIER', icon: Building2, nodes: suppliers },
      { title: '2. Ingredient Lots', type: 'INGREDIENT_LOT', icon: Box, nodes: ingredientLots },
      { title: '3. Production Batches', type: 'PRODUCTION_BATCH', icon: Layers, nodes: batches },
      { title: '4. Finished Goods', type: 'FINISHED_LOT', icon: ShoppingBag, nodes: finishedLots },
      { title: '5. Dispatch & Orders', type: 'CUSTOMER_ORDER', icon: Truck, nodes: orders },
    ];
  }, [traceResult]);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E6DF] shadow-xs flex flex-col overflow-hidden">
      {/* Control bar */}
      <div className="p-4 border-b border-[#E2E6DF] bg-[#F7F6F0]/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#173D32] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#173D32]" />
            Trace Graph: {traceResult.direction} Traversal
          </span>
          <span className="text-xs text-[#66746F]">({traceResult.nodes.length} connected entities)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-white rounded-lg border border-[#E2E6DF] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              className="p-1.5 hover:bg-[#F7F6F0] rounded text-[#66746F]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-[#27343A]">{Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))}
              className="p-1.5 hover:bg-[#F7F6F0] rounded text-[#66746F]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-[#F7F6F0] rounded text-[#66746F] border-l border-[#E2E6DF]"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Completeness Badge */}
          <div className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#E8F3ED] text-[#173D32] border border-[#C6DEC6] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{traceResult.completenessPercentage}% Provenance Grounded</span>
          </div>
        </div>
      </div>

      {/* Main 2D Flow Canvas */}
      <div 
        className="p-6 overflow-x-auto min-h-[460px] bg-[#FAF9F5] transition-transform duration-150 origin-top-left"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <div className="flex items-start gap-8 min-w-[980px]">
          {columns.map((col, cIdx) => (
            <div key={col.title} className="flex-1 flex flex-col gap-3 min-w-[200px]">
              {/* Column Header */}
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#173D32]/20">
                <col.icon className="w-4 h-4 text-[#527D68]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#173D32]">{col.title}</h4>
              </div>

              {/* Column Node Cards */}
              <div className="space-y-3">
                {col.nodes.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-[#CBD5CB] text-center text-xs text-[#66746F] bg-white/50">
                    No linked {col.type.toLowerCase().replace(/_/g, ' ')} records
                  </div>
                ) : (
                  col.nodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isRoot = node.id === traceResult.rootEntity.id;

                    return (
                      <div
                        key={node.id}
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          onSelectEntity?.(node.id);
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white relative ${
                          isSelected
                            ? 'ring-2 ring-[#173D32] border-[#173D32] shadow-md bg-[#F4F8F5]'
                            : 'border-[#E2E6DF] hover:border-[#CBD5CB] hover:shadow-xs'
                        }`}
                      >
                        {isRoot && (
                          <span className="absolute -top-2.5 right-3 bg-[#E9A23B] text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            ROOT TARGET
                          </span>
                        )}

                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <span className="text-[11px] font-bold font-mono text-[#173D32] bg-[#E8F3ED] px-1.5 py-0.5 rounded">
                            {node.code}
                          </span>
                          <StatusBadge certainty={node.certainty} size="sm" />
                        </div>

                        <h5 className="font-semibold text-xs text-[#27343A] line-clamp-2 mb-1.5 leading-snug">
                          {node.label}
                        </h5>

                        <div className="flex items-center justify-between text-[11px] text-[#66746F] pt-2 border-t border-[#F0F2ED]">
                          <span>{node.date}</span>
                          <span className="font-medium text-[#527D68] flex items-center gap-0.5">
                            {node.evidence.length} docs
                          </span>
                        </div>

                        {node.warnings && node.warnings.length > 0 && (
                          <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded flex items-center gap-1 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span className="truncate">{node.warnings[0]}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Entity Detailed Provenance Drawer */}
      {selectedNode && (
        <div className="p-5 border-t border-[#E2E6DF] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-[11px] font-bold font-mono text-[#527D68] uppercase tracking-wider block">
                Selected Entity Inspection
              </span>
              <h3 className="text-base font-bold text-[#173D32] flex items-center gap-2">
                {selectedNode.label}
                <StatusBadge status={selectedNode.status} certainty={selectedNode.certainty} />
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#66746F]">Identifier:</span>
              <span className="font-mono font-bold text-xs bg-[#F7F6F0] px-2 py-1 rounded border border-[#E2E6DF]">
                {selectedNode.id}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Key Value Details */}
            <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E8EDE6] space-y-1.5">
              <h4 className="text-xs font-semibold text-[#173D32] mb-1">Stored Business Attributes</h4>
              {Object.entries(selectedNode.details).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs py-0.5 border-b border-[#F0F2ED] last:border-none">
                  <span className="text-[#66746F]">{key}:</span>
                  <span className="font-medium text-[#27343A] text-right truncate max-w-[180px]">{String(value)}</span>
                </div>
              ))}
            </div>

            {/* Source Provenance Documents */}
            <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E8EDE6] space-y-2 lg:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-[#173D32] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#527D68]" />
                  Supporting Source Evidence ({selectedNode.evidence.length} Records)
                </h4>
                <span className="text-[11px] text-[#66746F]">Verified by human review</span>
              </div>

              {selectedNode.evidence.length === 0 ? (
                <div className="p-3 bg-white rounded-lg border border-dashed border-[#CBD5CB] text-xs text-[#66746F]">
                  No directly attached document extractions for this entity.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedNode.evidence.map((ev, i) => (
                    <EvidenceChip key={`${ev.documentId}-${i}`} evidence={ev} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
