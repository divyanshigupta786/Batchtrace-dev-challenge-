"""
BatchTrace Agent — Pydantic Schemas & Domain Contracts
Strictly typed data transfer objects matching the PostgreSQL 17-table relational schema.
"""

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

CertaintyLevel = Literal["CONFIRMED", "POSSIBLE", "UNKNOWN"]
DocumentStatus = Literal["UPLOADED", "PROCESSING", "REVIEW_REQUIRED", "APPROVED", "REJECTED"]
IncidentStatus = Literal["DRAFT", "INVESTIGATING", "NEEDS_REVIEW", "READY_FOR_APPROVAL", "APPROVED", "CLOSED"]

class SupplierSchema(BaseModel):
    id: str
    name: str
    country: str
    verified: bool = True

class IngredientLotSchema(BaseModel):
    id: str
    ingredient_name: str
    supplier_id: str
    supplier_name: str
    received_date: str
    received_quantity: float
    unit: str
    status: Literal["ACTIVE", "FLAGGED", "QUARANTINED", "DEPLETED"]
    flagged_reason: Optional[str] = None
    document_ref: str

class BatchInputSchema(BaseModel):
    ingredient_lot_id: str
    quantity_used: float
    unit: str
    source_row: int
    certainty: CertaintyLevel = "CONFIRMED"

class ProductionBatchSchema(BaseModel):
    id: str
    recipe_name: str
    production_date: str
    line_number: str
    inputs: List[BatchInputSchema]
    output_finished_lot_id: str
    quantity_produced: float
    unit: str
    document_ref: str

class FinishedLotSchema(BaseModel):
    id: str
    product_name: str
    batch_id: str
    best_before_date: str
    quantity_packaged: float
    unit: str
    qa_release_status: Literal["RELEASED", "HOLD", "RECALLED"]

class OrderItemSchema(BaseModel):
    finished_lot_id: str
    product_name: str
    quantity_ordered: float
    quantity_shipped: float
    unit: str
    certainty: CertaintyLevel = "CONFIRMED"

class CustomerOrderSchema(BaseModel):
    id: str
    customer_name: str
    order_date: str
    dispatch_date: str
    destination: str
    carrier: str
    items: List[OrderItemSchema]
    document_ref: str

class QuantityDiscrepancySchema(BaseModel):
    lot_id: str
    received: float
    consumed: float
    difference: float
    unit: str
    flagged: bool
    explanation: str

class TraceNodeSchema(BaseModel):
    id: str
    type: Literal["SUPPLIER", "INGREDIENT_LOT", "PRODUCTION_BATCH", "FINISHED_LOT", "CUSTOMER_ORDER"]
    label: str
    certainty: CertaintyLevel
    status: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class TraceEdgeSchema(BaseModel):
    source: str
    target: str
    certainty: CertaintyLevel
    document_ref: Optional[str] = None
    relationship: str

class ForwardTraceRequest(BaseModel):
    lot_id: str

class ForwardTraceResponse(BaseModel):
    root_lot_id: str
    confirmed_batches: List[str]
    confirmed_finished_lots: List[str]
    affected_orders: List[str]
    nodes: List[TraceNodeSchema]
    edges: List[TraceEdgeSchema]
    quantity_discrepancies: List[QuantityDiscrepancySchema]
    completeness_score: float

class BackwardTraceRequest(BaseModel):
    target_id: str # Finished lot or Customer order

class BackwardTraceResponse(BaseModel):
    root_target_id: str
    originating_batches: List[str]
    upstream_lots: List[str]
    suppliers: List[str]
    nodes: List[TraceNodeSchema]
    edges: List[TraceEdgeSchema]

class DocumentExtractionRequest(BaseModel):
    filename: str
    raw_text: str
    uploader_name: str

class ExtractedFieldSchema(BaseModel):
    field_name: str
    raw_value: str
    normalized_value: Any
    confidence: float
    source_row: int
    source_char_range: List[int]

class DocumentExtractionResponse(BaseModel):
    document_id: str
    detected_category: str
    extracted_fields: List[ExtractedFieldSchema]
    review_status: DocumentStatus
