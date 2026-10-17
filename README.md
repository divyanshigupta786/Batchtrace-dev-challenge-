# BatchTrace Agent — AI-Powered Food Traceability & Incident Intelligence Platform

> **"Every batch has a story. Find it instantly."**
> 
> Explainable, evidence-grounded food supply chain traceability and batch investigation platform designed for food manufacturers, bakeries, and packaged-food producers.

---

## 1. System Overview & Problem Statement

When an ingredient supplier issues an alert (e.g. *"Supplier lot L-204 has elevated DON mycotoxin levels"*), quality assurance and plant operations teams typically spend hours or days digging through disconnected spreadsheets, PDF invoices, paper traveler sheets, and carrier bills of lading to answer three critical questions:
1. **Which production batches consumed this ingredient lot?**
2. **Which finished-product lots and packaging runs were generated?**
3. **Which customer orders, distribution centers, and retailers received affected goods?**

**BatchTrace Agent** solves this through a dual-engine architecture:
- **Deterministic Relational Engine**: Serves as the immutable single source of truth. Traverses the graph, enforces mass balances, isolates quantity discrepancies, and computes certainty ratings (`CONFIRMED`, `POSSIBLE`, `UNKNOWN`).
- **Open-Weight AI Investigation Copilot**: Interacts via strictly typed, server-bounded tool calling (`get_ingredient_lot`, `trace_ingredient_lot`, `check_quantity_discrepancies`, `get_source_evidence`). Operates without hallucinating business entities or making autonomous recall decisions.

---

## 2. Core Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │      Source Documents (CSV, XLSX, PDF)       │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │      Document Ingestion & Provenance         │
                    │   (Preserves Document ID, Row, Page, Text)   │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │     Deterministic Graph Traversal Engine     │
                    │   (PostgreSQL 17-Table Schema / In-Memory)   │
                    └──────────────┬───────────────────────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    │                              │
                    ▼                              ▼
    ┌───────────────────────────────┐  ┌───────────────────────────────┐
    │     2D Trace Graph Explorer   │  │   Open-Weight AI Agent        │
    │  - Forward Traversal (Impact) │  │  - Qwen3-4B / Local Ollama    │
    │  - Backward Traversal (Root)  │  │  - Constrained Tool Calling   │
    │  - Mass Balance Reconciliation│  │  - Evidence Grounding         │
    └──────────────┬────────────────┘  └───────────────┬───────────────┘
                   │                                   │
                   └─────────────────┬─────────────────┘
                                     │
                                     ▼
                    ┌──────────────────────────────────────────────┐
                    │    Evidence-Backed Incident Dossier          │
                    │    - Affected Batches & Customer Orders      │
                    │    - Quantity Discrepancy Analysis           │
                    │    - Human Authority Sign-Off & Audit Trail  │
                    └──────────────────────────────────────────────┘
```

---

## 3. Key Capabilities & Deliverables

### A. TraceSphere 3D Interactive Storytelling
- Procedural 3D supply chain node network rendered in Three.js / React Three Fiber / Drei.
- Deep forest environment (`#102C25`) with interactive hover glow, camera controls, and connection arcs.
- Lightweight fallback poster for low-spec devices or when `prefers-reduced-motion` is active.

### B. Deterministic Forward & Backward Trace Engine
- **Forward Trace**: Lot `L-204` &rarr; Batches `PB-031` &amp; `PB-032` &rarr; Finished Lots `FP-101` &amp; `FP-102` &rarr; Orders `ORD-101`, `ORD-102`, `ORD-103`, `ORD-104`, `ORD-107`.
- **Backward Trace**: Finished Lot `FP-101` or Order `ORD-101` &rarr; Originating Batch `PB-031` &rarr; Upstream Lots (`L-204` Oats, `L-205` Honey, `L-207` Coconut Oil) &rarr; Suppliers.
- **Certainty Ratings**:
  - `CONFIRMED`: Backed by approved document records (e.g. signed Batch Sheet `DOC-803`).
  - `POSSIBLE`: Pending QA review (e.g. Batch Sheet `DOC-804`).
  - `UNKNOWN`: Missing records explicitly highlighted.

### C. Mass Balance & Quantity Reconciliation
- Automatically detects mass balance discrepancies.
- **Intentional Synthetic Discrepancy**: Lot `L-204` was received as 1,200 kg. Batch `PB-031` consumed 800 kg; Batch `PB-032` consumed 450 kg. Total consumed = 1,250 kg. The system automatically flags a **-50 kg negative variance**.

### D. Side-by-Side Document Review & Ingestion
- Ingests CSVs, XLSX sheets, invoices, and dock logs.
- Two-panel review layout: Raw source text on left, editable validated fields on right with Save Draft, Approve & Persist, or Reject.

### E. Controlled AI Agent (Qwen3-4B / Ollama / Fallback)
- Open-weight model adapter with live status indicator (`Connected`, `Processing`, `Fallback Mode`).
- Step-by-step tool execution trace displayed in the chat interface.
- Consequential proposals (such as creating an incident report) require explicit human authorization.

### F. Formal Incident Management & Audit Trail
- Incident lifecycle: `DRAFT` &rarr; `INVESTIGATING` &rarr; `NEEDS_REVIEW` &rarr; `READY_FOR_APPROVAL` &rarr; `APPROVED` &rarr; `CLOSED`.
- Audit-ready printable layout (`window.print()`).
- Immutable audit log tracking actor name, timestamp, action, and JSON state diffs.

---

## 4. Synthetic Demo Dataset: Meadow Pantry Products Inc.

- **Suppliers**: Greenfield Ingredients Co. (`SUP-01`), Sunrise Apiaries (`SUP-02`), Andean Cacao Traders (`SUP-03`).
- **Ingredient Lots**:
  - `L-204`: Organic Rolled Oats (1,200 kg received, FLAGGED for mycotoxin advisory).
  - `L-205`: Wildflower Honey (600 kg received, ACTIVE).
  - `L-206`: Roasted Cacao Nibs (400 kg received, ACTIVE).
  - `L-207`: Virgin Coconut Oil (300 kg received, ACTIVE).
- **Production Batches**:
  - `PB-031`: Artisan Honey Granola (Consumed 800 kg `L-204`; produced 1,800 pouches `FP-101`).
  - `PB-032`: Honey Oat Energy Bars (Consumed 450 kg `L-204`; produced 950 cartons `FP-102`).
  - `PB-033`: Dark Chocolate Crunch (Produced 1,200 pouches `FP-103`).
- **Customer Dispatches**:
  - `ORD-101`: Whole Foods Market Northeast DC (600 pouches `FP-101`).
  - `ORD-102`: FreshDirect Fulfillment (450 pouches `FP-101`, 300 cartons `FP-102`).
  - `ORD-103`: Trader Joe's Mid-Atlantic (600 pouches `FP-101`).
  - `ORD-104`: Apex Regional Foodservice (500 cartons `FP-102`).
  - `ORD-107`: Sprouts Farmers Market Regional (150 pouches `FP-101`).
  - `ORD-109`: Wegmans (Demonstrates intentional missing line-item link for data-quality auditing).

---

## 5. Local Setup & Quickstart

### Prerequisites
- Node.js 18+ or 20+ (Node v24 tested)
- npm or pnpm
- Optional: Local [Ollama](https://ollama.com/) with `ollama run qwen2.5:3b`

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd batchtrace-agent

# Install dependencies
npm install

# Run the deterministic verification test suite
npx tsx scripts/test-engine.ts

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- Marketing & 3D TraceSphere: `/`
- Operations Overview Dashboard: `/app`
- Traceability Explorer: `/app/trace`
- Document Review Inbox: `/app/documents`
- AI Investigation Workspace: `/app/agent`
- Incident Reports Dossier: `/app/incidents`
- Immutable Audit Trail: `/app/audit`
- Settings & Model Config: `/app/settings`

---

## 6. Supabase Database Schema Migration

The complete production database DDL is located in:
`supabase/migrations/20261017000000_batchtrace_schema.sql`

Contains:
- 17 normalized relational tables (`organizations`, `organization_members`, `documents`, `document_extractions`, `suppliers`, `ingredients`, `ingredient_lots`, `production_batches`, `batch_inputs`, `finished_products`, `finished_lots`, `customer_orders`, `order_items`, `traceability_events`, `incident_reports`, `incident_evidence`, `audit_logs`).
- Row Level Security (RLS) enabled on all tables with tenant isolation policies.
- Performance indexes on lot codes, batch codes, order numbers, and foreign keys.

To run migration on Supabase:
```bash
npx supabase db push
```

---

## 7. Running Verification Tests

```bash
npx tsx scripts/test-engine.ts
```

Output:
```
--- Running BatchTrace Deterministic Engine & AI Verification Tests ---
✅ PASSED: Root entity is L-204
✅ PASSED: Forward trace linked approved Batch PB-031
✅ PASSED: Forward trace linked Batch PB-032
✅ PASSED: Forward trace linked Finished Lot FP-101
✅ PASSED: Forward trace linked Finished Lot FP-102
✅ PASSED: Affected orders include ORD-101 (Whole Foods)
✅ PASSED: Affected orders include ORD-102 (FreshDirect)
✅ PASSED: Affected orders include ORD-103 (Trader Joes)
✅ PASSED: Affected orders include ORD-104 (Apex)
✅ PASSED: Detected exactly 1 quantity discrepancy on L-204
✅ PASSED: Detected 50 kg negative variance (1200 received vs 1250 consumed)
✅ PASSED: Backward trace root is FP-101
✅ PASSED: Traced back to Batch PB-031
✅ PASSED: Traced back to Lot L-204 (Oats)
✅ PASSED: Traced back to Lot L-205 (Honey)
✅ PASSED: Traced back to Supplier Greenfield Ingredients
✅ PASSED: Document category classified as SUPPLIER_INVOICE
✅ PASSED: Extracted Lot L-999 with exact coordinates
✅ PASSED: Extracted and normalized quantity to 500
✅ PASSED: AI agent executed 4 controlled tools for Lot L-204
✅ PASSED: AI response grounded in actual batches PB-031 and PB-032
✅ PASSED: AI response noted 50 kg discrepancy
✅ PASSED: AI agent proposed formal human sign-off action

🎉 ALL 5 TEST SUITES PASSED!
```

---

## 8. Deployment & Documentation Guides

- **Production Deployment Guide**: [`DEPLOYMENT.md`](file:///c:/Users/india/OneDrive/Desktop/dev%20challenge%203/DEPLOYMENT.md).
- Brand tokens, design system, and assets documented in [`ASSETS.md`](file:///c:/Users/india/OneDrive/Desktop/dev%20challenge%203/ASSETS.md).
- LLM and AI agent specification documented in [`public/llms.txt`](file:///c:/Users/india/OneDrive/Desktop/dev%20challenge%203/public/llms.txt).
- Comprehensive Product Guide in [`public/docs/product-guide.md`](file:///c:/Users/india/OneDrive/Desktop/dev%20challenge%203/public/docs/product-guide.md).
