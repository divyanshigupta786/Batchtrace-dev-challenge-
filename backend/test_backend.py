"""
Unit tests for BatchTrace Python deterministic engine and API schemas.
"""

import pytest
from engine import DeterministicTraceEngine

def test_forward_trace_lot_204():
    engine = DeterministicTraceEngine()
    result = engine.trace_forward("L-204")

    assert result.root_lot_id == "L-204"
    assert "PB-031" in result.confirmed_batches
    assert "PB-032" in result.confirmed_batches
    assert "FP-101" in result.confirmed_finished_lots
    assert "FP-102" in result.confirmed_finished_lots
    assert "ORD-101" in result.affected_orders
    assert "ORD-102" in result.affected_orders
    assert "ORD-103" in result.affected_orders
    assert "ORD-104" in result.affected_orders
    assert "ORD-107" in result.affected_orders

    # Verify mass balance discrepancy on L-204
    assert len(result.quantity_discrepancies) == 1
    disc = result.quantity_discrepancies[0]
    assert disc.lot_id == "L-204"
    assert disc.received == 1200.0
    assert disc.consumed == 1250.0
    assert disc.difference == 50.0
    assert disc.flagged is True

def test_backward_trace_finished_lot():
    engine = DeterministicTraceEngine()
    result = engine.trace_backward("FP-101")

    assert result.root_target_id == "FP-101"
    assert "PB-031" in result.originating_batches
    assert "L-204" in result.upstream_lots
    assert "L-205" in result.upstream_lots
    assert "SUP-01" in result.suppliers

def test_document_extraction():
    engine = DeterministicTraceEngine()
    sample_text = """COMMERCIAL BILL OF LADING
Supplier: Greenfield Ingredients Co.
Lot: L-8812
Quantity: 450.0 kg
Delivery Date: 2026-09-28"""

    res = engine.extract_document(
        filename="bol_sample.txt",
        raw_text=sample_text,
        uploader_name="QA Operator"
    )

    assert res.detected_category == "DISPATCH_MANIFEST"
    assert len(res.extracted_fields) >= 2
    lot_field = next(f for f in res.extracted_fields if f.field_name == "IngredientLotNumber")
    assert lot_field.normalized_value == "L-8812"
    qty_field = next(f for f in res.extracted_fields if f.field_name == "QuantityExtracted")
    assert qty_field.normalized_value == 450.0

if __name__ == "__main__":
    test_forward_trace_lot_204()
    test_backward_trace_finished_lot()
    test_document_extraction()
    print("\n[SUCCESS] ALL PYTHON BACKEND ENGINE TESTS PASSED!\n")
