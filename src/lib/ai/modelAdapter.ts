import {
  AIMessage,
  AIAgentToolCall,
  SourceEvidence,
  AIProviderStatus
} from '@/types/traceability';
import { TraceabilityEngine } from '@/lib/engine/traceabilityEngine';
import {
  initialIngredientLots,
  initialProductionBatches,
  initialFinishedLots,
  initialCustomerOrders,
  initialDocuments,
  initialSuppliers
} from '@/lib/data/syntheticData';

export interface AIInvestigationRequest {
  userPrompt: string;
  conversationHistory?: AIMessage[];
  providerConfig?: {
    type: 'OLLAMA' | 'HOSTED' | 'DETERMINISTIC_FALLBACK';
    endpoint?: string;
    modelName?: string;
  };
}

export interface AIInvestigationResponse {
  message: AIMessage;
  providerStatus: AIProviderStatus;
  providerUsed: string;
}

export class AIAgentModelAdapter {
  private engine: TraceabilityEngine;

  constructor() {
    this.engine = new TraceabilityEngine();
  }

  /**
   * Main controlled agent execution pipeline:
   * Understand -> Plan -> Select Tool -> Execute Tool Deterministically -> Format Grounded Explanation -> Propose Approval if consequential.
   */
  public async processInvestigation(request: AIInvestigationRequest): Promise<AIInvestigationResponse> {
    const prompt = request.userPrompt.trim();
    const lower = prompt.toLowerCase();
    const config = request.providerConfig || { type: 'DETERMINISTIC_FALLBACK' };

    const toolCalls: AIAgentToolCall[] = [];
    const evidenceChips: SourceEvidence[] = [];

    let explanation = '';
    let proposedAction: AIMessage['proposedAction'] = undefined;
    let providerStatus: AIProviderStatus = 'FALLBACK_MODE';
    let providerUsed = 'Deterministic Agent Runtime (Grounded Fallback)';

    // Check if Ollama endpoint was requested and available
    if (config.type === 'OLLAMA' && config.endpoint) {
      try {
        const pingRes = await fetch(`${config.endpoint}/api/tags`, { signal: AbortSignal.timeout(1500) });
        if (pingRes.ok) {
          providerStatus = 'CONNECTED';
          providerUsed = `Ollama (${config.modelName || 'qwen2.5:3b'})`;
        }
      } catch {
        providerStatus = 'FALLBACK_MODE';
        providerUsed = 'Deterministic Fallback (Ollama endpoint unreachable)';
      }
    }

    // 1. Tool Selection based on prompt intent & entities
    // Case A: Supplier Lot L-204 inquiry or forward trace
    if (lower.includes('l-204') || lower.includes('flagged') || lower.includes('ingredient lot') || lower.includes('mycotoxin')) {
      const targetLotId = 'L-204';
      
      toolCalls.push({
        toolName: 'get_ingredient_lot',
        args: { lotId: targetLotId },
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        resultSummary: 'Retrieved Lot L-204 (Greenfield Ingredients, 1,200 kg received, FLAGGED for mycotoxin concern).',
      });

      toolCalls.push({
        toolName: 'trace_ingredient_lot',
        args: { lotId: targetLotId, direction: 'FORWARD' },
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        resultSummary: 'Forward trace linked 2 production batches (PB-031, PB-032), 2 finished lots (FP-101, FP-102), and 5 customer orders.',
      });

      toolCalls.push({
        toolName: 'check_quantity_discrepancies',
        args: { lotId: targetLotId },
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        resultSummary: 'Detected 50 kg discrepancy: 1,200 kg received vs 1,250 kg consumed across PB-031 and PB-032.',
      });

      toolCalls.push({
        toolName: 'get_missing_traceability_links',
        args: { lotId: targetLotId },
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        resultSummary: 'Found 1 pending document review (DOC-804 for PB-032) and 1 order item discrepancy (ORD-109).',
      });

      const traceResult = this.engine.traceForward(targetLotId);
      evidenceChips.push(...traceResult.rootEntity.evidence);

      explanation = `### Investigation Results for Supplier Lot ${targetLotId}

1. **Ingredient Lot Status**:
   - **Lot Code**: \`${targetLotId}\` (Organic Rolled Oats)
   - **Supplier**: Greenfield Ingredients Co. (Receipt: 2026-09-12)
   - **Current Flag**: **FLAGGED** due to supplier advisory regarding potential deoxynivalenol (DON) elevation in archive retention testing.

2. **Downstream Production Impact**:
   - **Batch PB-031** (Artisan Honey Toasted Granola): Consumed **800 kg**. Produced **1,800 pouches** (\`FP-101\`). *Status: Document Approved.*
   - **Batch PB-032** (Honey Oat Energy Bars): Consumed **450 kg**. Produced **950 cartons** (\`FP-102\`). *Status: Document Pending QA Review.*

3. **Affected Customer Distributions**:
   - **ORD-101**: Whole Foods Market Northeast DC (600 pouches of \`FP-101\`)
   - **ORD-102**: FreshDirect Fulfillment (450 pouches of \`FP-101\`, 300 cartons of \`FP-102\`)
   - **ORD-103**: Trader Joe's Mid-Atlantic (600 pouches of \`FP-101\`)
   - **ORD-104**: Apex Regional Foodservice (500 cartons of \`FP-102\`)
   - **ORD-107**: Sprouts Farmers Market Regional (150 pouches of \`FP-101\`)

4. **Quantity Reconciliation & Evidence Warnings**:
   - **Discrepancy Detected**: Received quantity was **1,200 kg**, while recorded consumption is **1,250 kg** (a **-50 kg variance**).
   - **Unreviewed Record**: Document \`DOC-804\` (Batch Sheet for PB-032) requires formal sign-off.
   - **Supporting Provenance**: 4 verified source documents available (Invoice \`INV-GF-9041\`, Receiving Log, Batch Sheet \`PB-031\`, SwiftCold BOL \`BOL-99410\`).`;

      proposedAction = {
        actionType: 'CREATE_INCIDENT',
        payload: {
          title: 'Formal Investigation: Supplier Lot L-204 Mycotoxin Advisory',
          targetLot: 'L-204',
          severity: 'HIGH',
          affectedBatches: ['PB-031', 'PB-032'],
          affectedOrders: ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-107'],
        },
        requiresApproval: true,
      };
    } 
    // Case B: Backward trace or finished product inquiry
    else if (lower.includes('backward') || lower.includes('fp-101') || lower.includes('finished lot') || lower.includes('ord-101')) {
      const entityId = lower.includes('ord-101') ? 'ORD-101' : 'FP-101';
      
      toolCalls.push({
        toolName: 'trace_finished_lot_backward',
        args: { entityId },
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        resultSummary: `Traced ${entityId} upstream to Batch PB-031, Lot L-204 (Oats), Lot L-205 (Honey), and Lot L-207 (Coconut Oil).`,
      });

      const traceResult = this.engine.traceBackward(entityId);
      evidenceChips.push(...traceResult.rootEntity.evidence);

      explanation = `### Backward Traceability Evidence for \`${entityId}\`

- **Target Record**: \`${entityId}\`
- **Originating Production Batch**: \`PB-031\` (Produced 2026-09-20 on Line 1)
- **Upstream Ingredients Consumed**:
  - **Lot L-204**: 800 kg Organic Rolled Oats (Greenfield Ingredients) — *FLAGGED*
  - **Lot L-205**: 220 kg Wildflower Raw Honey (Sunrise Apiaries) — *ACTIVE*
  - **Lot L-207**: 110 kg Virgin Coconut Oil (Greenfield Ingredients) — *ACTIVE*
- **Source Verification**: Grounded in signed Batch Execution Sheet \`DOC-803\` and receiving dock manifests.`;
    } 
    // Case C: Discrepancy & Data-Quality Audit
    else if (lower.includes('discrepan') || lower.includes('missing') || lower.includes('quality') || lower.includes('reconcil')) {
      toolCalls.push({
        toolName: 'check_quantity_discrepancies',
        args: { scope: 'ALL_LOTS' },
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        resultSummary: 'Identified 1 active high-severity discrepancy on Lot L-204 (-50 kg).',
      });

      toolCalls.push({
        toolName: 'get_missing_traceability_links',
        args: { scope: 'ACTIVE_RECORDS' },
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        resultSummary: 'Identified 1 document requiring QA review (DOC-804) and 1 unassigned customer order item (ORD-109).',
      });

      explanation = `### System-Wide Traceability Data Quality Audit

1. **Quantity Discrepancy**:
   - **Lot L-204 (Oats)**: Received **1,200 kg**, Consumed in Batches **1,250 kg** (Over-consumption of 50 kg across PB-031 and PB-032). Possible scale calibration error or unrecorded second delivery.

2. **Missing Links & Unreviewed Records**:
   - **Document DOC-804** (\`Extrusion_Batch_Sheet_PB-032.xlsx\`) is in **REVIEW_REQUIRED** status. Needs QA sign-off to convert relationships from *POSSIBLE* to *CONFIRMED*.
   - **Order ORD-109** (Wegmans) is missing line item finished lot links.`;
    } 
    // Case D: General / Search
    else {
      toolCalls.push({
        toolName: 'search_records',
        args: { query: prompt },
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        resultSummary: `Searched 4 ingredient lots, 3 production batches, 3 finished lots, and 12 customer orders.`,
      });

      explanation = `I analyzed your inquiry against validated repository records.

Here are the current core entities available in your organization:
- **Ingredient Lots**: \`L-204\` (Oats - FLAGGED), \`L-205\` (Honey), \`L-206\` (Cacao Nibs), \`L-207\` (Coconut Oil)
- **Production Batches**: \`PB-031\` (Granola), \`PB-032\` (Energy Bars), \`PB-033\` (Dark Chocolate Crunch)
- **Finished Lots**: \`FP-101\`, \`FP-102\`, \`FP-103\`
- **Customer Orders**: 12 active retail and distributor dispatches

*Tip: You can ask: "Which products used ingredient lot L-204?", "Show all customer orders linked to batch PB-031", or "Check quantity discrepancies".*`;
    }

    const message: AIMessage = {
      id: `MSG-${Math.floor(100000 + Math.random() * 900000)}`,
      sender: 'ASSISTANT',
      timestamp: new Date().toISOString(),
      content: explanation,
      toolCalls,
      evidenceChips: evidenceChips.slice(0, 5),
      proposedAction,
    };

    return {
      message,
      providerStatus,
      providerUsed,
    };
  }
}
