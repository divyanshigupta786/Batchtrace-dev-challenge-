# BatchTrace Agent — Comprehensive Product Guide & Architecture Manual

## 1. Product Summary
**BatchTrace Agent** is a food safety intelligence and traceability platform built specifically for small-to-medium packaged-food producers, bakeries, and processing plants.

When an ingredient supplier notifies your quality team that a specific lot code has a defect, contamination alert, or pathogen issue (e.g., Lot `L-204`), BatchTrace discovers every batch that touched it, reconciles quantities, pulls original source documents, and produces an evidence-grounded incident report.

---

## 2. Core Workflow

```
[Supplier Invoice / PDF / CSV]
             │
             ▼
[Document Ingestion & Coordinate Parser]
             │ (Preserves page, row, raw text, normalized value)
             ▼
[Deterministic Graph Traversal Engine] ◄── [PostgreSQL / Relational Store]
             │
             ├── Forward Trace: Ingredient Lot ──► Batches ──► Finished Lots ──► Orders
             └── Backward Trace: Customer Order ──► Finished Lot ──► Batch ──► Ingredients
             │
             ▼
[Open-Weight AI Agent (Qwen3-4B / Ollama)]
             │ (Strictly bounded tool calling: search, trace, discrepancy audit)
             ▼
[Incident Evidence Report & Human QA Sign-Off]
```

---

## 3. Data Integrity & Certainty Rules

1. **Confirmed**: Every entity link has an approved document citation (e.g. signed batch execution sheet `DOC-803`).
2. **Possible**: Relationship is indicated in a pending review document (e.g. unreviewed batch sheet `DOC-804`) or fuzzy matching rule.
3. **Unknown**: A link is broken or absent. We never fabricate downstream orders if shipping manifests are missing.

---

## 4. Quantity Reconciliation
- Received Quantity vs. Sum of Production Usage.
- Example: Lot `L-204` received 1,200 kg. Batch `PB-031` used 800 kg; Batch `PB-032` used 450 kg. Total used = 1,250 kg. The system detects and flags a **-50 kg discrepancy**.

---

## 5. Security & Isolation
- **Row Level Security (RLS)** isolates all tables by `org_id`.
- **Audit Logging**: Every document approval, trace execution, and incident status change is stored with actor name, timestamp, and JSON diffs.
- **Decision Support**: The product advises QA teams but never executes autonomous external product recalls.
