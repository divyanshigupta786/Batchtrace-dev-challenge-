"""
BatchTrace Agent — Deterministic Python Traceability & Extraction Engine
Executes forward graph traversal, backward root analysis, and mass balance audits.
"""

import re
import uuid
from typing import Dict, List, Any, Optional
from schemas import (
    SupplierSchema,
    IngredientLotSchema,
    ProductionBatchSchema,
    FinishedLotSchema,
    CustomerOrderSchema,
    ForwardTraceResponse,
    BackwardTraceResponse,
    TraceNodeSchema,
    TraceEdgeSchema,
    QuantityDiscrepancySchema,
    DocumentExtractionResponse,
    ExtractedFieldSchema,
)

# Deterministic Seed Data (Meadow Pantry Products Inc.)
DEMO_SUPPLIERS = [
    SupplierSchema(id="SUP-01", name="Greenfield Ingredients Co.", country="USA", verified=True),
    SupplierSchema(id="SUP-02", name="Sunrise Apiaries", country="USA", verified=True),
    SupplierSchema(id="SUP-03", name="Andean Cacao Traders", country="Ecuador", verified=True),
]

DEMO_INGREDIENT_LOTS = [
    IngredientLotSchema(
        id="L-204",
        ingredient_name="Organic Rolled Oats",
        supplier_id="SUP-01",
        supplier_name="Greenfield Ingredients Co.",
        received_date="2026-09-12",
        received_quantity=1200.0,
        unit="kg",
        status="FLAGGED",
        flagged_reason="Supplier alert: elevated DON mycotoxin in grain silo #4",
        document_ref="DOC-801",
    ),
    IngredientLotSchema(
        id="L-205",
        ingredient_name="Wildflower Honey",
        supplier_id="SUP-02",
        supplier_name="Sunrise Apiaries",
        received_date="2026-09-14",
        received_quantity=600.0,
        unit="kg",
        status="ACTIVE",
        document_ref="DOC-802",
    ),
    IngredientLotSchema(
        id="L-206",
        ingredient_name="Roasted Cacao Nibs",
        supplier_id="SUP-03",
        supplier_name="Andean Cacao Traders",
        received_date="2026-09-15",
        received_quantity=400.0,
        unit="kg",
        status="ACTIVE",
        document_ref="DOC-805",
    ),
]

DEMO_BATCHES = [
    ProductionBatchSchema(
        id="PB-031",
        recipe_name="Artisan Honey Granola",
        production_date="2026-09-16",
        line_number="Line 1",
        inputs=[
            {"ingredient_lot_id": "L-204", "quantity_used": 800.0, "unit": "kg", "source_row": 14, "certainty": "CONFIRMED"},
            {"ingredient_lot_id": "L-205", "quantity_used": 350.0, "unit": "kg", "source_row": 15, "certainty": "CONFIRMED"},
        ],
        output_finished_lot_id="FP-101",
        quantity_produced=1800.0,
        unit="pouches",
        document_ref="DOC-803",
    ),
    ProductionBatchSchema(
        id="PB-032",
        recipe_name="Honey Oat Energy Bars",
        production_date="2026-09-18",
        line_number="Line 3",
        inputs=[
            {"ingredient_lot_id": "L-204", "quantity_used": 450.0, "unit": "kg", "source_row": 9, "certainty": "CONFIRMED"},
            {"ingredient_lot_id": "L-205", "quantity_used": 230.0, "unit": "kg", "source_row": 10, "certainty": "CONFIRMED"},
        ],
        output_finished_lot_id="FP-102",
        quantity_produced=950.0,
        unit="cartons",
        document_ref="DOC-804",
    ),
    ProductionBatchSchema(
        id="PB-033",
        recipe_name="Dark Chocolate Crunch",
        production_date="2026-09-19",
        line_number="Line 2",
        inputs=[
            {"ingredient_lot_id": "L-206", "quantity_used": 380.0, "unit": "kg", "source_row": 12, "certainty": "CONFIRMED"},
        ],
        output_finished_lot_id="FP-103",
        quantity_produced=1200.0,
        unit="pouches",
        document_ref="DOC-806",
    ),
]

DEMO_FINISHED_LOTS = [
    FinishedLotSchema(
        id="FP-101",
        product_name="Artisan Honey Granola (12 oz)",
        batch_id="PB-031",
        best_before_date="2027-06-17",
        quantity_packaged=1800.0,
        unit="pouches",
        qa_release_status="HOLD",
    ),
    FinishedLotSchema(
        id="FP-102",
        product_name="Honey Oat Energy Bars (6-pack)",
        batch_id="PB-032",
        best_before_date="2027-05-20",
        quantity_packaged=950.0,
        unit="cartons",
        qa_release_status="HOLD",
    ),
    FinishedLotSchema(
        id="FP-103",
        product_name="Dark Chocolate Crunch (10 oz)",
        batch_id="PB-033",
        best_before_date="2027-08-11",
        quantity_packaged=1200.0,
        unit="pouches",
        qa_release_status="RELEASED",
    ),
]

DEMO_ORDERS = [
    CustomerOrderSchema(
        id="ORD-101",
        customer_name="Whole Foods Market (Northeast DC)",
        order_date="2026-09-20",
        dispatch_date="2026-09-21",
        destination="Cheverly, MD",
        carrier="SwiftCold Logistics",
        items=[
            {"finished_lot_id": "FP-101", "product_name": "Artisan Honey Granola", "quantity_ordered": 600, "quantity_shipped": 600, "unit": "pouches", "certainty": "CONFIRMED"}
        ],
        document_ref="DOC-901",
    ),
    CustomerOrderSchema(
        id="ORD-102",
        customer_name="FreshDirect Regional Fulfillment",
        order_date="2026-09-21",
        dispatch_date="2026-09-22",
        destination="Bronx, NY",
        carrier="Metro Express Fleet",
        items=[
            {"finished_lot_id": "FP-101", "product_name": "Artisan Honey Granola", "quantity_ordered": 450, "quantity_shipped": 450, "unit": "pouches", "certainty": "CONFIRMED"},
            {"finished_lot_id": "FP-102", "product_name": "Honey Oat Energy Bars", "quantity_ordered": 300, "quantity_shipped": 300, "unit": "cartons", "certainty": "CONFIRMED"},
        ],
        document_ref="DOC-902",
    ),
    CustomerOrderSchema(
        id="ORD-103",
        customer_name="Trader Joe's Mid-Atlantic DC",
        order_date="2026-09-22",
        dispatch_date="2026-09-23",
        destination="Nazareth, PA",
        carrier="Keystone Freight",
        items=[
            {"finished_lot_id": "FP-101", "product_name": "Artisan Honey Granola", "quantity_ordered": 600, "quantity_shipped": 600, "unit": "pouches", "certainty": "CONFIRMED"}
        ],
        document_ref="DOC-903",
    ),
    CustomerOrderSchema(
        id="ORD-104",
        customer_name="Apex Foodservice Distributors",
        order_date="2026-09-23",
        dispatch_date="2026-09-24",
        destination="Richmond, VA",
        carrier="FreightForward Inc",
        items=[
            {"finished_lot_id": "FP-102", "product_name": "Honey Oat Energy Bars", "quantity_ordered": 500, "quantity_shipped": 500, "unit": "cartons", "certainty": "CONFIRMED"}
        ],
        document_ref="DOC-904",
    ),
    CustomerOrderSchema(
        id="ORD-107",
        customer_name="Sprouts Farmers Market Regional",
        order_date="2026-09-25",
        dispatch_date="2026-09-26",
        destination="Philadelphia, PA",
        carrier="Mid-Atlantic Logistics",
        items=[
            {"finished_lot_id": "FP-101", "product_name": "Artisan Honey Granola", "quantity_ordered": 150, "quantity_shipped": 150, "unit": "pouches", "certainty": "CONFIRMED"}
        ],
        document_ref="DOC-907",
    ),
]


class DeterministicTraceEngine:
    def __init__(self):
        self.suppliers = {s.id: s for s in DEMO_SUPPLIERS}
        self.ingredient_lots = {l.id: l for l in DEMO_INGREDIENT_LOTS}
        self.batches = {b.id: b for b in DEMO_BATCHES}
        self.finished_lots = {f.id: f for f in DEMO_FINISHED_LOTS}
        self.orders = {o.id: o for o in DEMO_ORDERS}

    def trace_forward(self, lot_id: str) -> ForwardTraceResponse:
        lot = self.ingredient_lots.get(lot_id)
        if not lot:
            raise ValueError(f"Ingredient lot '{lot_id}' not found in database.")

        nodes: List[TraceNodeSchema] = []
        edges: List[TraceEdgeSchema] = []
        confirmed_batches = []
        confirmed_finished = []
        affected_orders = set()

        # Root Node
        nodes.append(TraceNodeSchema(
            id=lot.id,
            type="INGREDIENT_LOT",
            label=f"{lot.id} ({lot.ingredient_name})",
            certainty="CONFIRMED",
            status=lot.status,
            metadata={"received_qty": lot.received_quantity, "unit": lot.unit, "supplier": lot.supplier_name}
        ))

        # Supplier Node
        supplier = self.suppliers.get(lot.supplier_id)
        if supplier:
            nodes.append(TraceNodeSchema(
                id=supplier.id,
                type="SUPPLIER",
                label=supplier.name,
                certainty="CONFIRMED",
                metadata={"country": supplier.country}
            ))
            edges.append(TraceEdgeSchema(
                source=supplier.id,
                target=lot.id,
                certainty="CONFIRMED",
                relationship="SUPPLIED_LOT",
                document_ref=lot.document_ref
            ))

        # Traversal Step 1: Batches consuming this lot
        total_consumed = 0.0
        for b in self.batches.values():
            for inp in b.inputs:
                if inp.ingredient_lot_id == lot.id:
                    confirmed_batches.append(b.id)
                    total_consumed += inp.quantity_used
                    nodes.append(TraceNodeSchema(
                        id=b.id,
                        type="PRODUCTION_BATCH",
                        label=f"{b.id} ({b.recipe_name})",
                        certainty=inp.certainty,
                        metadata={"line": b.line_number, "produced_qty": b.quantity_produced, "unit": b.unit}
                    ))
                    edges.append(TraceEdgeSchema(
                        source=lot.id,
                        target=b.id,
                        certainty=inp.certainty,
                        relationship="CONSUMED_IN_BATCH",
                        document_ref=b.document_ref
                    ))

                    # Traversal Step 2: Finished Goods produced by this batch
                    f_lot = self.finished_lots.get(b.output_finished_lot_id)
                    if f_lot:
                        confirmed_finished.append(f_lot.id)
                        nodes.append(TraceNodeSchema(
                            id=f_lot.id,
                            type="FINISHED_LOT",
                            label=f"{f_lot.id} ({f_lot.product_name})",
                            certainty="CONFIRMED",
                            status=f_lot.qa_release_status,
                            metadata={"packaged_qty": f_lot.quantity_packaged, "best_before": f_lot.best_before_date}
                        ))
                        edges.append(TraceEdgeSchema(
                            source=b.id,
                            target=f_lot.id,
                            certainty="CONFIRMED",
                            relationship="PRODUCED_FINISHED_LOT",
                            document_ref=b.document_ref
                        ))

                        # Traversal Step 3: Orders receiving this finished lot
                        for ord in self.orders.values():
                            for item in ord.items:
                                if item.finished_lot_id == f_lot.id:
                                    affected_orders.add(ord.id)
                                    nodes.append(TraceNodeSchema(
                                        id=ord.id,
                                        type="CUSTOMER_ORDER",
                                        label=f"{ord.id} - {ord.customer_name}",
                                        certainty=item.certainty,
                                        metadata={"shipped_qty": item.quantity_shipped, "destination": ord.destination}
                                    ))
                                    edges.append(TraceEdgeSchema(
                                        source=f_lot.id,
                                        target=ord.id,
                                        certainty=item.certainty,
                                        relationship="SHIPPED_IN_ORDER",
                                        document_ref=ord.document_ref
                                    ))

        # Deduplicate nodes by id
        unique_nodes = {n.id: n for n in nodes}.values()

        # Mass Balance Reconciliation
        discrepancies = []
        diff = lot.received_quantity - total_consumed
        if abs(diff) > 0.01:
            discrepancies.append(QuantityDiscrepancySchema(
                lot_id=lot.id,
                received=lot.received_quantity,
                consumed=total_consumed,
                difference=round(abs(diff), 2),
                unit=lot.unit,
                flagged=True,
                explanation=f"Negative variance: Received {lot.received_quantity} {lot.unit}, but production recorded {total_consumed} {lot.unit} consumed (deficit of {round(abs(diff), 2)} {lot.unit})."
            ))

        return ForwardTraceResponse(
            root_lot_id=lot.id,
            confirmed_batches=sorted(list(set(confirmed_batches))),
            confirmed_finished_lots=sorted(list(set(confirmed_finished))),
            affected_orders=sorted(list(affected_orders)),
            nodes=list(unique_nodes),
            edges=edges,
            quantity_discrepancies=discrepancies,
            completeness_score=1.0 if not discrepancies else 0.85
        )

    def trace_backward(self, target_id: str) -> BackwardTraceResponse:
        nodes: List[TraceNodeSchema] = []
        edges: List[TraceEdgeSchema] = []
        originating_batches = []
        upstream_lots = []
        suppliers = []

        # Find target finished lot
        f_lot = self.finished_lots.get(target_id)
        if f_lot:
            nodes.append(TraceNodeSchema(
                id=f_lot.id,
                type="FINISHED_LOT",
                label=f"{f_lot.id} ({f_lot.product_name})",
                certainty="CONFIRMED",
                status=f_lot.qa_release_status
            ))

            batch = self.batches.get(f_lot.batch_id)
            if batch:
                originating_batches.append(batch.id)
                nodes.append(TraceNodeSchema(
                    id=batch.id,
                    type="PRODUCTION_BATCH",
                    label=f"{batch.id} ({batch.recipe_name})",
                    certainty="CONFIRMED"
                ))
                edges.append(TraceEdgeSchema(
                    source=batch.id,
                    target=f_lot.id,
                    certainty="CONFIRMED",
                    relationship="PRODUCED_LOT"
                ))

                for inp in batch.inputs:
                    lot = self.ingredient_lots.get(inp.ingredient_lot_id)
                    if lot:
                        upstream_lots.append(lot.id)
                        nodes.append(TraceNodeSchema(
                            id=lot.id,
                            type="INGREDIENT_LOT",
                            label=f"{lot.id} ({lot.ingredient_name})",
                            certainty=inp.certainty,
                            status=lot.status
                        ))
                        edges.append(TraceEdgeSchema(
                            source=lot.id,
                            target=batch.id,
                            certainty=inp.certainty,
                            relationship="CONSUMED_IN_BATCH"
                        ))

                        supp = self.suppliers.get(lot.supplier_id)
                        if supp:
                            suppliers.append(supp.id)
                            nodes.append(TraceNodeSchema(
                                id=supp.id,
                                type="SUPPLIER",
                                label=supp.name,
                                certainty="CONFIRMED"
                            ))
                            edges.append(TraceEdgeSchema(
                                source=supp.id,
                                target=lot.id,
                                certainty="CONFIRMED",
                                relationship="SUPPLIED_LOT"
                            ))

        unique_nodes = {n.id: n for n in nodes}.values()

        return BackwardTraceResponse(
            root_target_id=target_id,
            originating_batches=sorted(list(set(originating_batches))),
            upstream_lots=sorted(list(set(upstream_lots))),
            suppliers=sorted(list(set(suppliers))),
            nodes=list(unique_nodes),
            edges=edges
        )

    def extract_document(self, filename: str, raw_text: str, uploader_name: str) -> DocumentExtractionResponse:
        doc_id = f"DOC-{uuid.uuid4().hex[:6].upper()}"
        fields: List[ExtractedFieldSchema] = []

        # Determine category based on keywords
        category = "SUPPLIER_INVOICE"
        if "BATCH" in raw_text.upper() or "LINE" in raw_text.upper():
            category = "BATCH_RECORD"
        elif "DISPATCH" in raw_text.upper() or "BILL OF LADING" in raw_text.upper():
            category = "DISPATCH_MANIFEST"

        # Regex Coordinate Parsers
        lot_match = re.search(r"(?:Lot|LOT)[#:\s]+([A-Z0-9-]+)", raw_text)
        if lot_match:
            fields.append(ExtractedFieldSchema(
                field_name="IngredientLotNumber",
                raw_value=lot_match.group(0),
                normalized_value=lot_match.group(1),
                confidence=0.98,
                source_row=raw_text[:lot_match.start()].count("\n") + 1,
                source_char_range=[lot_match.start(), lot_match.end()]
            ))

        qty_match = re.search(r"(\d+(?:\.\d+)?)\s*(kg|lbs|pouches|cartons)", raw_text, re.IGNORECASE)
        if qty_match:
            fields.append(ExtractedFieldSchema(
                field_name="QuantityExtracted",
                raw_value=qty_match.group(0),
                normalized_value=float(qty_match.group(1)),
                confidence=0.96,
                source_row=raw_text[:qty_match.start()].count("\n") + 1,
                source_char_range=[qty_match.start(), qty_match.end()]
            ))

        return DocumentExtractionResponse(
            document_id=doc_id,
            detected_category=category,
            extracted_fields=fields,
            review_status="REVIEW_REQUIRED"
        )
