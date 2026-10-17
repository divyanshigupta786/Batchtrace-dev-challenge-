'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/shared/AppHeader';
import { EvidenceChip } from '@/components/shared/EvidenceChip';
import { AIMessage, AIAgentToolCall, SourceEvidence } from '@/types/traceability';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  RotateCcw,
  UserCheck,
  ChevronDown
} from 'lucide-react';

function AIAgentWorkspaceInner() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [input, setInput] = useState(initialPrompt);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'MSG-INIT',
      sender: 'ASSISTANT',
      timestamp: '2026-10-17 09:00:00',
      content: `Hello Elena. I am your BatchTrace AI Investigation Copilot. 

I operate through **constrained, server-side tools** over your organization's validated PostgreSQL records. Every claim I make is grounded in actual invoices, receiving sheets, and batch production sheets.

You can ask me to trace lots, evaluate mass balance discrepancies, identify affected retail orders, or draft evidence-backed incident reports.`,
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [providerConfig, setProviderConfig] = useState<{
    type: 'DETERMINISTIC_FALLBACK' | 'OLLAMA' | 'HOSTED';
    modelName: string;
    endpoint: string;
  }>({
    type: 'DETERMINISTIC_FALLBACK',
    modelName: 'Qwen3-4B',
    endpoint: 'http://localhost:11434',
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendPrompt(initialPrompt);
    }
  }, []);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: AIMessage = {
      id: `USER-${Date.now()}`,
      sender: 'USER',
      timestamp: new Date().toISOString(),
      content: promptText,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/ai/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          history: messages,
          providerConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.message) {
        setMessages(prev => [...prev, data.data.message]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `ERR-${Date.now()}`,
            sender: 'ASSISTANT',
            timestamp: new Date().toISOString(),
            content: `Error: ${data.error || 'Failed to process investigation.'}`,
          },
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ERR-${Date.now()}`,
          sender: 'ASSISTANT',
          timestamp: new Date().toISOString(),
          content: `Connection error: ${err.message}`,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveProposal = async (proposal: NonNullable<AIMessage['proposedAction']>, msgId: string) => {
    if (proposal.actionType === 'CREATE_INCIDENT') {
      const p = proposal.payload as any;
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: p.title,
          targetLotOrBatch: p.targetLot,
          targetType: 'INGREDIENT_LOT',
          severity: p.severity,
          confirmedBatches: p.affectedBatches,
          confirmedOrders: p.affectedOrders,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev =>
          prev.map(m =>
            m.id === msgId && m.proposedAction
              ? { ...m, proposedAction: { ...m.proposedAction, isApproved: true } }
              : m
          )
        );
        alert(`Incident ${data.data.incidentNumber} created and recorded in audit log.`);
      }
    }
  };

  const samplePrompts = [
    'Supplier lot L-204 has been flagged for a possible quality issue. Which production batches and customer orders are linked?',
    'Trace finished product lot FP-101 backward to source ingredients and suppliers.',
    'Check system-wide quantity discrepancies and missing records.',
    'What source documents support the connection between Lot L-204 and Batch PB-031?',
  ];

  return (
    <div className="flex-1 flex flex-col h-screen">
      <AppHeader
        title="AI investigation workspace"
        description="Controlled open-weight reasoning agent with schema-bounded tool calling and provenance citations."
      />

      <div className="flex-1 flex flex-col min-w-0 max-w-5xl mx-auto w-full p-4 sm:p-6 overflow-hidden">
        {/* Model Config Strip */}
        <div className="mb-4 bg-white p-3 rounded-xl border border-[#E2E6DF] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[#173D32] flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#527D68]" />
              Model Architecture:
            </span>
            <span className="font-mono bg-[#E8F3ED] text-[#173D32] px-2 py-0.5 rounded font-bold">
              {providerConfig.modelName} via {providerConfig.type.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#66746F]">
            <span className="text-[11px]">Tool Boundary:</span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono font-medium text-slate-700">
              10 Typed Tools Active
            </span>
          </div>
        </div>

        {/* Chat Stream Window */}
        <div className="flex-1 bg-white rounded-2xl border border-[#E2E6DF] shadow-xs overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'USER';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#173D32] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4 text-[#DCE8DF]" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
                    isUser
                      ? 'bg-[#173D32] text-white font-medium shadow-xs'
                      : 'bg-[#FAF9F5] border border-[#E8EDE6] text-[#27343A] shadow-xs'
                  }`}
                >
                  {/* Tool Call Trace Steps (For Assistant) */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-[#E2E6DF] space-y-2 mb-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#527D68] uppercase tracking-wider pb-1 border-b border-[#F0F2ED]">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5" />
                          Tool Execution Trace ({msg.toolCalls.length} calls)
                        </span>
                        <span className="text-emerald-700 font-mono text-[10px]">ALL VERIFIED</span>
                      </div>

                      <div className="space-y-1.5 font-mono text-[11px]">
                        {msg.toolCalls.map((t, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-slate-700">
                            <span className="text-[#527D68] font-bold">&gt;</span>
                            <div>
                              <span className="font-semibold text-[#173D32]">{t.toolName}</span>
                              <span className="text-[#66746F]">({JSON.stringify(t.args)})</span>
                              {t.resultSummary && (
                                <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                                  {t.resultSummary}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Message Content */}
                  <div className="whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">
                    {msg.content}
                  </div>

                  {/* Evidence Chips */}
                  {msg.evidenceChips && msg.evidenceChips.length > 0 && (
                    <div className="pt-3 border-t border-[#E8EDE6] space-y-1.5">
                      <span className="text-[11px] font-bold text-[#173D32] flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#527D68]" />
                        Grounded Source Citations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.evidenceChips.map((ev, i) => (
                          <EvidenceChip key={i} evidence={ev} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Consequential Proposal Card Requiring Human Approval */}
                  {msg.proposedAction && (
                    <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#E9A23B] shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#B8710E] flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-[#E9A23B]" />
                          Human Sign-Off Proposal Required
                        </span>
                        <span className="text-[10px] bg-[#FFF3DB] text-[#B8710E] px-2 py-0.5 rounded font-mono font-bold">
                          Consequential Action
                        </span>
                      </div>
                      <p className="text-xs text-[#27343A]">
                        The agent proposes creating a formal investigation dossier: <strong>{(msg.proposedAction.payload as any).title}</strong>.
                      </p>
                      
                      <div className="pt-2 flex items-center justify-end">
                        {msg.proposedAction.isApproved ? (
                          <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Approved by Elena Rostova &amp; Created
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApproveProposal(msg.proposedAction!, msg.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-[#E9A23B]" />
                            <span>Authorize &amp; Create Incident</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#DCE8DF] text-[#173D32] flex items-center justify-center shrink-0 font-bold text-xs">
                    ER
                  </div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-3 text-xs text-[#527D68]">
              <div className="w-8 h-8 rounded-lg bg-[#173D32] text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center gap-2 bg-[#FAF9F5] p-3 rounded-xl border border-[#E8EDE6]">
                <span className="w-2 h-2 rounded-full bg-[#E9A23B] animate-ping" />
                <span>Executing controlled tool sequence over PostgreSQL store...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Prompts Pill Bar */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-[#66746F] shrink-0">Sample Queries:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendPrompt(p)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-[#E2E6DF] hover:border-[#173D32] hover:bg-[#F7F6F0] text-[11px] text-[#27343A] font-medium transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="mt-2 flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#E2E6DF] shadow-sm"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about ingredient lots, batches, orders, or discrepancies..."
            className="flex-1 px-3 py-2 text-xs text-[#27343A] font-medium focus:outline-none"
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="px-4 py-2 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
          >
            <span>Ask Agent</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AIAgentWorkspacePage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 text-xs text-[#527D68]">
        Loading AI Investigation Workspace...
      </div>
    }>
      <AIAgentWorkspaceInner />
    </Suspense>
  );
}
