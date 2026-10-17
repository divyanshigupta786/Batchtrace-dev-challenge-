'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Package, 
  Factory, 
  Truck, 
  Scale, 
  Sparkles, 
  FileSearch,
  ExternalLink
} from 'lucide-react';

interface SimulatorScenario {
  id: string;
  name: string;
  ingredient: string;
  supplier: string;
  receivedQty: string;
  status: 'FLAGGED' | 'ACTIVE';
  statusReason?: string;
  discrepancy?: {
    variance: string;
    note: string;
  };
  steps: {
    title: string;
    subtitle: string;
    code: string;
    icon: any;
    meta: string;
    isWarning?: boolean;
  }[];
  affectedOrders: string[];
}

const SCENARIOS: SimulatorScenario[] = [
  {
    id: 'L-204',
    name: 'Lot L-204',
    ingredient: 'Organic Rolled Oats',
    supplier: 'Greenfield Ingredients Co. (SUP-01)',
    receivedQty: '1,200 kg',
    status: 'FLAGGED',
    statusReason: 'Supplier alert: Elevated DON mycotoxin detected in milling lot.',
    discrepancy: {
      variance: '-50 kg (Over-consumed)',
      note: 'Received 1,200 kg; PB-031 consumed 800 kg + PB-032 consumed 450 kg = 1,250 kg used.',
    },
    steps: [
      {
        title: 'Supplier Receipt',
        subtitle: 'Greenfield Ingredients Co.',
        code: 'INV-GF-9041',
        icon: Building2,
        meta: '1,200 kg received on 2026-09-12',
      },
      {
        title: 'Production Batches',
        subtitle: 'Honey Granola & Energy Bars',
        code: 'PB-031 + PB-032',
        icon: Factory,
        meta: '1,250 kg total consumed across 2 lines',
        isWarning: true,
      },
      {
        title: 'Finished Inventory',
        subtitle: 'Pouches & Retail Cartons',
        code: 'FP-101 + FP-102',
        icon: Package,
        meta: '2,750 packaged units quarantined',
        isWarning: true,
      },
      {
        title: 'Retail Dispatches',
        subtitle: 'Whole Foods, FreshDirect, Trader Joe\'s',
        code: '5 Customer Orders',
        icon: Truck,
        meta: 'ORD-101, 102, 103, 104, 107',
        isWarning: true,
      },
    ],
    affectedOrders: ['ORD-101 (Whole Foods)', 'ORD-102 (FreshDirect)', 'ORD-103 (Trader Joe\'s)', 'ORD-104 (Apex)', 'ORD-107 (Sprouts)'],
  },
  {
    id: 'L-205',
    name: 'Lot L-205',
    ingredient: 'Wildflower Honey',
    supplier: 'Sunrise Apiaries (SUP-02)',
    receivedQty: '600 kg',
    status: 'ACTIVE',
    steps: [
      {
        title: 'Supplier Receipt',
        subtitle: 'Sunrise Apiaries',
        code: 'INV-SA-4410',
        icon: Building2,
        meta: '600 kg received on 2026-09-14',
      },
      {
        title: 'Production Batches',
        subtitle: 'Granola & Energy Bars',
        code: 'PB-031 + PB-032',
        icon: Factory,
        meta: '580 kg consumed (20 kg safe buffer)',
      },
      {
        title: 'Finished Inventory',
        subtitle: 'Granola & Energy Bars',
        code: 'FP-101 + FP-102',
        icon: Package,
        meta: 'Passed micro-testing',
      },
      {
        title: 'Retail Dispatches',
        subtitle: 'Standard Distribution',
        code: '4 Dispatches',
        icon: Truck,
        meta: 'ORD-101, 102, 103, 107',
      },
    ],
    affectedOrders: ['ORD-101 (Whole Foods)', 'ORD-102 (FreshDirect)', 'ORD-103 (Trader Joe\'s)', 'ORD-107 (Sprouts)'],
  },
  {
    id: 'L-206',
    name: 'Lot L-206',
    ingredient: 'Roasted Cacao Nibs',
    supplier: 'Andean Cacao Traders (SUP-03)',
    receivedQty: '400 kg',
    status: 'ACTIVE',
    steps: [
      {
        title: 'Supplier Receipt',
        subtitle: 'Andean Cacao Traders',
        code: 'INV-ACT-2019',
        icon: Building2,
        meta: '400 kg received on 2026-09-15',
      },
      {
        title: 'Production Batches',
        subtitle: 'Dark Chocolate Crunch',
        code: 'PB-033',
        icon: Factory,
        meta: '380 kg consumed on Line 2',
      },
      {
        title: 'Finished Inventory',
        subtitle: 'Dark Chocolate Pouch',
        code: 'FP-103',
        icon: Package,
        meta: '1,200 pouches produced',
      },
      {
        title: 'Retail Dispatches',
        subtitle: 'Regional Distribution',
        code: '2 Dispatches',
        icon: Truck,
        meta: 'ORD-105, ORD-108',
      },
    ],
    affectedOrders: ['ORD-105 (Kroger Mid-Atlantic)', 'ORD-108 (Target Distribution)'],
  },
];

export function TraceSimulator() {
  const [selectedId, setSelectedId] = useState('L-204');
  const scenario = SCENARIOS.find((s) => s.id === selectedId) || SCENARIOS[0];

  return (
    <div className="bg-white rounded-3xl border border-[#E2E6DF] shadow-xl overflow-hidden transition-all">
      {/* Top Banner / Scenario Switcher */}
      <div className="bg-[#173D32] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[#527D68]/40 text-[#E9A23B]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#DCE8DF]">
              Interactive Trace Simulation
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Live Traversal &amp; Discrepancy Auditing
          </h3>
          <p className="text-xs sm:text-sm text-[#A5C2B4]">
            Select an ingredient lot to watch how the deterministic engine resolves the entire supply chain.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#102C25] p-1.5 rounded-xl border border-[#527D68]/40 self-start md:self-center">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
                selectedId === s.id
                  ? 'bg-[#E9A23B] text-black shadow-sm'
                  : 'text-[#DCE8DF] hover:text-white hover:bg-[#173D32]'
              }`}
            >
              <span>{s.name}</span>
              {s.status === 'FLAGGED' && (
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Body */}
      <div className="p-6 sm:p-8 space-y-8">
        {/* Scenario Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E2E6DF]">
          <div>
            <div className="flex items-center gap-2.5">
              <h4 className="text-lg font-extrabold text-[#173D32] font-mono">{scenario.id}</h4>
              <span className="text-sm font-semibold text-[#27343A]">&mdash; {scenario.ingredient}</span>
              <span
                className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full ${
                  scenario.status === 'FLAGGED'
                    ? 'bg-[#FCE9E7] text-[#B94343] border border-[#B94343]/30'
                    : 'bg-[#E8F3ED] text-[#173D32] border border-[#527D68]/30'
                }`}
              >
                {scenario.status === 'FLAGGED' ? 'Flagged Quality Concern' : 'Verified Lot'}
              </span>
            </div>
            <p className="text-xs text-[#66746F] mt-1">
              Supplier: <span className="font-medium text-[#27343A]">{scenario.supplier}</span> &bull; Received Quantity: <span className="font-mono font-medium text-[#27343A]">{scenario.receivedQty}</span>
            </p>
          </div>

          {scenario.status === 'FLAGGED' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF3DB] border border-[#E9A23B]/40 text-xs font-medium text-[#B8710E]">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#E9A23B]" />
              <span>{scenario.statusReason}</span>
            </div>
          )}
        </div>

        {/* 4-Step Animated Pipeline Visualizer */}
        <div className="relative">
          {/* Animated Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-1 bg-[#E2E6DF] -translate-y-1/2 z-0">
            <motion.div
              className={`h-full ${scenario.status === 'FLAGGED' ? 'bg-[#E9A23B]' : 'bg-[#527D68]'}`}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {scenario.steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={`${scenario.id}-${step.title}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.12, duration: 0.4 }}
                  className={`p-5 rounded-2xl border transition-all relative bg-white shadow-xs hover:shadow-md ${
                    step.isWarning
                      ? 'border-[#E9A23B] bg-[#FAF9F5]'
                      : 'border-[#E2E6DF] hover:border-[#CBD5CB]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#F7F6F0] text-[#527D68]">
                      STAGE 0{idx + 1}
                    </span>
                    <div
                      className={`p-2 rounded-xl ${
                        step.isWarning
                          ? 'bg-[#FFF3DB] text-[#E9A23B]'
                          : 'bg-[#E8F3ED] text-[#173D32]'
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <h5 className="font-bold text-sm text-[#27343A]">{step.title}</h5>
                  <p className="text-xs font-medium text-[#66746F] mb-2">{step.subtitle}</p>
                  
                  <div className="mt-auto pt-2 border-t border-[#E8EDE6] flex flex-col gap-1">
                    <span className="font-mono text-xs font-semibold text-[#173D32]">
                      {step.code}
                    </span>
                    <span className="text-[11px] text-[#66746F]">{step.meta}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Discrepancy & Mass Balance Banner if applicable */}
        <AnimatePresence mode="wait">
          {scenario.discrepancy && (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#FFF3DB] p-5 rounded-2xl border border-[#E9A23B]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#E9A23B] text-black shrink-0 mt-0.5 sm:mt-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#B8710E]">
                      Mass Balance Discrepancy Detected
                    </span>
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-[#B8710E] text-white">
                      {scenario.discrepancy.variance}
                    </span>
                  </div>
                  <p className="text-xs text-[#27343A] mt-1 leading-relaxed">
                    {scenario.discrepancy.note}
                  </p>
                </div>
              </div>

              <Link
                href="/app/agent"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-all shadow-xs"
              >
                <FileSearch className="w-3.5 h-3.5 text-[#E9A23B]" />
                <span>Investigate with AI</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Affected Entities Bar */}
        <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E6DF] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#527D68]">
              Confirmed Downstream Order Linkages:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {scenario.affectedOrders.map((ord) => (
                <span
                  key={ord}
                  className="font-mono text-xs px-2.5 py-1 rounded-lg bg-white border border-[#E2E6DF] text-[#27343A] font-medium shadow-2xs"
                >
                  {ord}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <Link
              href={`/app/trace?search=${scenario.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] text-xs font-semibold transition-all shadow-xs"
            >
              <span>Explore Interactive Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
