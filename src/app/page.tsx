'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PublicNavbar } from '@/components/shared/PublicNavbar';
import { PublicFooter } from '@/components/shared/PublicFooter';
import { SmoothScroll } from '@/components/shared/SmoothScroll';
import { TraceSphere } from '@/components/3d/TraceSphere';
import { HeroDecorativeLines } from '@/components/home/HeroAnimations';
import { TraceSimulator } from '@/components/home/TraceSimulator';
import { ComparisonShowcase } from '@/components/home/ComparisonShowcase';
import { 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Search, 
  AlertTriangle, 
  FileText, 
  Cpu, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Database,
  UserCheck,
  ChevronRight,
  Fingerprint,
  Workflow
} from 'lucide-react';

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
};

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F0] selection:bg-[#E9A23B]/30 selection:text-[#173D32]">
      <SmoothScroll />
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero Section with Atmospheric Gradients & Anime.js Line Effects */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          {/* Ambient Lighting Mesh Glow */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#DCE8DF] rounded-full blur-3xl opacity-70 pointer-events-none" />
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#E8F3ED] rounded-full blur-3xl opacity-60 pointer-events-none" />
          
          {/* Animated SVG Path Overlays */}
          <HeroDecorativeLines />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Headline */}
              <motion.div 
                className="lg:col-span-6 space-y-6"
                initial="hidden"
                animate="visible"
                variants={STAGGER_CONTAINER}
              >
                <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F3ED] border border-[#C6DEC6] text-xs font-semibold text-[#173D32] shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#527D68] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#173D32]"></span>
                  </span>
                  <span>AI-Powered Food Traceability &amp; Batch Investigation</span>
                </motion.div>

                <motion.h1 
                  variants={FADE_UP}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#173D32] tracking-tight leading-[1.08]"
                >
                  Every batch has a story. <br />
                  <span className="text-[#527D68] relative inline-block">
                    Find it instantly.
                    <motion.span 
                      className="absolute bottom-1 left-0 right-0 h-2 bg-[#E9A23B]/30 -z-10 rounded-sm"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                    />
                  </span>
                </motion.h1>

                <motion.p 
                  variants={FADE_UP}
                  className="text-base sm:text-lg text-[#66746F] leading-relaxed max-w-xl"
                >
                  When a supplier flags a lot code, stop rummaging through disconnected spreadsheets and PDFs. 
                  BatchTrace connects receiving manifests, batch execution sheets, and dispatch logs into an explainable, 
                  evidence-grounded intelligence graph.
                </motion.p>

                {/* Primary CTAs */}
                <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/app"
                    className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-sm transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Launch Live Demo</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#27343A] hover:bg-[#FAF9F5] border border-[#E2E6DF] font-semibold text-sm transition-all shadow-xs hover:border-[#CBD5CB]"
                  >
                    <span>See How It Works</span>
                  </Link>
                </motion.div>

                {/* Trust stats */}
                <motion.div variants={FADE_UP} className="pt-6 border-t border-[#E2E6DF] grid grid-cols-3 gap-4 text-left">
                  <div className="p-2.5 rounded-xl hover:bg-white/50 transition-colors">
                    <span className="block text-2xl font-black text-[#173D32] font-mono">100%</span>
                    <span className="text-xs text-[#66746F] font-medium">Grounded Evidence</span>
                  </div>
                  <div className="p-2.5 rounded-xl hover:bg-white/50 transition-colors">
                    <span className="block text-2xl font-black text-[#173D32] font-mono">&lt; 3 sec</span>
                    <span className="text-xs text-[#66746F] font-medium">Forward &amp; Back Trace</span>
                  </div>
                  <div className="p-2.5 rounded-xl hover:bg-white/50 transition-colors">
                    <span className="block text-2xl font-black text-[#173D32] font-mono">Zero</span>
                    <span className="text-xs text-[#66746F] font-medium">Hallucinated Data</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right 3D TraceSphere Showcase */}
              <motion.div 
                className="lg:col-span-6 relative"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              >
                {/* Visual Backdrop Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-[#173D32]/20 via-[#527D68]/20 to-[#E9A23B]/20 rounded-3xl blur-xl opacity-75 -z-10" />
                <TraceSphere />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Interactive Live Simulator Section */}
        <section className="py-16 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <TraceSimulator />
          </motion.div>
        </section>

        {/* 4-Step Architecture Workflow with Motion Cards */}
        <section className="py-20 max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#527D68] block mb-2">
              Explainable Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173D32] tracking-tight">
              From raw receipts to defensible recall intelligence
            </h2>
            <p className="text-sm text-[#66746F] mt-3">
              Deterministic PostgreSQL engine enforces mass balances and citations, while an open-weight AI copilot interprets queries and drafts incident dossiers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Ingest & Extract',
                desc: 'Upload CSVs, XLSX sheets, invoices, and dock receiving logs. Extracted fields preserve page, row, and exact text coordinates.',
                icon: FileText,
                badge: 'Coordinate Grounding',
              },
              {
                step: '02',
                title: 'Deterministic Trace',
                desc: 'PostgreSQL relational engine executes forward and backward graph traversal. Quantities are strictly reconciled without hallucination.',
                icon: Database,
                badge: 'Mass Balance Engine',
              },
              {
                step: '03',
                title: 'AI Investigation',
                desc: 'Open-weight Qwen model operates through constrained tool calls to interpret queries, evaluate discrepancies, and draft reports.',
                icon: Cpu,
                badge: 'Bounded Tool Calling',
              },
              {
                step: '04',
                title: 'Human Review & Audit',
                desc: 'No consequential recall or customer notification is executed autonomously. Explicit QA sign-off is recorded in immutable audit logs.',
                icon: UserCheck,
                badge: 'Immutable Provenance',
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div 
                  key={card.step} 
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group bg-white p-6 rounded-3xl border border-[#E2E6DF] shadow-xs hover:border-[#527D68]/50 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-[#527D68] bg-[#F7F6F0] px-2.5 py-1 rounded-lg">
                        STEP {card.step}
                      </span>
                      <div className="p-2.5 rounded-xl bg-[#E8F3ED] text-[#173D32] group-hover:bg-[#173D32] group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-[#27343A] mb-2">{card.title}</h3>
                    <p className="text-xs text-[#66746F] leading-relaxed mb-4">{card.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-[#E8EDE6] flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#527D68]">
                      {card.badge}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#A5C2B4] group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Operational Comparison Section */}
        <section className="py-16 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <ComparisonShowcase />
          </motion.div>
        </section>

        {/* Principles Section */}
        <section className="py-20 bg-[#173D32] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#527D68]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <motion.div 
              className="text-center max-w-2xl mx-auto mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-[#E9A23B] block mb-2">
                Product Principles
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Built for Food Safety Integrity, Not Speculation
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: CheckCircle2,
                  title: 'Deterministic Ground Truth',
                  desc: 'The validated database and graph traversal engine are the single source of truth. AI assists with interpretation and drafting, but never invents lots, batches, or relationships.',
                },
                {
                  icon: AlertTriangle,
                  title: 'Uncertainty is Explicit',
                  desc: 'Every link is classified as Confirmed, Possible, or Unknown. Missing records remain missing; we never extrapolate customer lists when records are incomplete.',
                },
                {
                  icon: Lock,
                  title: 'Tenant Isolation & Audit',
                  desc: 'Row Level Security isolates confidential customer data. All extraction approvals, trace queries, and report authorizations are recorded with actor, timestamp, and before/after diffs.',
                },
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.12, duration: 0.5 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-[#102C25] p-7 rounded-2xl border border-[#527D68]/40 space-y-3 hover:border-[#E9A23B]/60 transition-colors shadow-lg"
                  >
                    <div className="p-2.5 rounded-xl bg-[#173D32] inline-block text-[#E9A23B] border border-[#527D68]/30">
                      <ItemIcon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-base text-[#F7F6F0]">{item.title}</h4>
                    <p className="text-xs text-[#CBD8D1] leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F3ED] text-[#173D32] text-xs font-semibold mb-4 border border-[#C6DEC6]">
              <Sparkles className="w-3.5 h-3.5 text-[#E9A23B]" />
              <span>Full Production MVP Ready for Evaluation</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#173D32] tracking-tight mb-4">
              Experience Grounded Food Traceability Today
            </h2>
            <p className="text-base text-[#66746F] max-w-xl mx-auto mb-8 leading-relaxed">
              Explore the Meadow Pantry Products synthetic dataset, execute forward traces, interact with the controlled AI agent, and generate audit-ready incident reports.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-sm transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Open Operations Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/app/agent"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#27343A] hover:bg-[#FAF9F5] border border-[#E2E6DF] font-semibold text-sm transition-all shadow-xs hover:border-[#CBD5CB]"
              >
                <Cpu className="w-4 h-4 text-[#527D68]" />
                <span>Test AI Agent</span>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
