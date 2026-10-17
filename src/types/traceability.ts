// BatchTrace Agent - Comprehensive Domain Types
// Strictly typed entities for deterministic traceability, documents, AI agent, and audit trail.

export type CertaintyLevel = 'CONFIRMED' | 'POSSIBLE' | 'UNKNOWN';

export type EntityType = 
  | 'SUPPLIER'
  | 'INGREDIENT_LOT'
  | 'PRODUCTION_BATCH'
  | 'FINISHED_LOT'
  | 'CUSTOMER_ORDER';

export interface Supplier {
  id: string;
  orgId: string;
  name: string;
  code: string;
  country: string;
  certifications: string[];
  contactEmail: string;
}

export interface Ingredient {
  id: string;
  orgId: string;
  name: string;
  sku: string;
  category: string;
  allergens: string[];
  storageCondition: 'AMBIENT' | 'CHILLED' | 'FROZEN';
}

export interface IngredientLot {
  id: string; // e.g. "L-204"
  orgId: string;
  ingredientId: string;
  ingredientName: string;
  supplierId: string;
  supplierName: string;
  receiptDate: string;
  receivedQuantity: number;
  consumedQuantity: number;
  unit: string; // e.g. "kg"
  expiryDate: string;
  poNumber: string;
  carrierInvoice: string;
  status: 'ACTIVE' | 'FLAGGED' | 'EXHAUSTED' | 'QUARANTINED';
  qualityFlagReason?: string;
}

export interface BatchInput {
  id: string;
  batchId: string;
  ingredientLotId: string;
  ingredientName: string;
  quantityUsed: number;
  unit: string;
  stageAdded: string;
  addedAt: string;
  operatorId: string;
}

export interface ProductionBatch {
  id: string; // e.g. "PB-031"
  orgId: string;
  recipeName: string;
  productionDate: string;
  facilityLine: string;
  supervisor: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'QUARANTINED' | 'RECALLED';
  inputs: BatchInput[];
  outputQuantity: number;
  outputUnit: string;
}

export interface FinishedProduct {
  id: string;
  orgId: string;
  name: string;
  sku: string;
  packSize: string;
  shelfLifeDays: number;
}

export interface FinishedLot {
  id: string; // e.g. "FP-101"
  orgId: string;
  productId: string;
  productName: string;
  productionBatchId: string;
  packDate: string;
  bestBeforeDate: string;
  quantityProduced: number;
  quantityShipped: number;
  unit: string; // e.g. "cases", "units"
  status: 'RELEASED' | 'HOLD' | 'RECALLED';
}

export interface OrderItem {
  id: string;
  orderId: string;
  finishedLotId: string;
  productName: string;
  quantityShipped: number;
  unit: string;
}

export interface CustomerOrder {
  id: string; // e.g. "ORD-101"
  orgId: string;
  orderNumber: string;
  customerName: string;
  customerType: 'RETAIL' | 'DISTRIBUTOR' | 'FOODSERVICE' | 'DIRECT';
  destinationCity: string;
  orderDate: string;
  dispatchDate: string;
  carrierName: string;
  status: 'DELIVERED' | 'IN_TRANSIT' | 'PROCESSING';
  items: OrderItem[];
}

export interface DocumentRecord {
  id: string;
  orgId: string;
  filename: string;
  fileType: 'CSV' | 'XLSX' | 'PDF' | 'TXT' | 'JSON';
  category: 'SUPPLIER_INVOICE' | 'RECEIVING_LOG' | 'BATCH_RECORD' | 'FINISHED_PACK_SHEET' | 'DISPATCH_MANIFEST';
  uploadedAt: string;
  uploaderName: string;
  fileSizeBytes: number;
  status: 'UPLOADED' | 'PROCESSING' | 'REVIEW_REQUIRED' | 'APPROVED' | 'REJECTED';
  recordCount: number;
  extractedRecords: ExtractedFieldRecord[];
  rawTextPreview?: string;
  errorMessage?: string;
}

export interface ExtractedFieldRecord {
  id: string;
  documentId: string;
  fieldName: string;
  originalText: string;
  normalizedValue: string | number;
  sourceLocation: {
    page?: number;
    row?: number;
    column?: string;
  };
  confidence: number;
  extractionMethod: 'DETERMINISTIC_PARSER' | 'AI_EXTRACTOR';
  validationStatus: 'VALID' | 'WARNING' | 'CONFLICT' | 'MISSING';
  validationMessage?: string;
  reviewed: boolean;
  reviewedBy?: string;
}

export interface SourceEvidence {
  documentId: string;
  documentName: string;
  documentCategory: string;
  rowOrPage: string;
  extractedText: string;
  verifiedValue: string;
  timestamp: string;
}

export interface TraceNode {
  id: string;
  type: EntityType;
  label: string;
  code: string;
  date: string;
  status: string;
  certainty: CertaintyLevel;
  details: Record<string, string | number | undefined>;
  evidence: SourceEvidence[];
  warnings?: string[];
}

export interface TraceEdge {
  id: string;
  source: string;
  target: string;
  certainty: CertaintyLevel;
  relationship: string;
  quantityTransferred?: number;
  unit?: string;
  rationale?: string;
}

export interface QuantityDiscrepancy {
  entityId: string;
  entityType: EntityType;
  description: string;
  expectedAmount: number;
  actualAmount: number;
  unit: string;
  difference: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MissingLink {
  fromEntityId: string;
  fromType: EntityType;
  expectedTargetType: EntityType;
  reason: string;
  remediationStep: string;
}

export interface TraceResult {
  rootEntity: TraceNode;
  direction: 'FORWARD' | 'BACKWARD';
  nodes: TraceNode[];
  edges: TraceEdge[];
  confirmedBatches: string[];
  affectedOrders: string[];
  possibleEdges: TraceEdge[];
  missingLinks: MissingLink[];
  quantityDiscrepancies: QuantityDiscrepancy[];
  evidenceCount: number;
  isComplete: boolean;
  completenessPercentage: number;
  investigationSummary: string;
}

export type IncidentStatus = 
  | 'DRAFT'
  | 'INVESTIGATING'
  | 'NEEDS_REVIEW'
  | 'READY_FOR_APPROVAL'
  | 'APPROVED'
  | 'CLOSED';

export interface IncidentReport {
  id: string;
  orgId: string;
  incidentNumber: string;
  title: string;
  targetLotOrBatch: string;
  targetType: EntityType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  investigatorName: string;
  description: string;
  confirmedBatches: string[];
  confirmedOrders: string[];
  possibleLinksCount: number;
  quantityDiscrepanciesCount: number;
  missingRecordsCount: number;
  evidenceItems: SourceEvidence[];
  recommendedSteps: string[];
  limitations: string[];
  approvedBy?: string;
  approvedAt?: string;
  humanSignOffNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  orgId: string;
  timestamp: string;
  actor: {
    name: string;
    email: string;
    role: string;
  };
  action: 
    | 'DOCUMENT_UPLOAD'
    | 'EXTRACTION_COMPLETED'
    | 'RECORD_APPROVED'
    | 'RECORD_REJECTED'
    | 'TRACE_EXECUTED'
    | 'INCIDENT_CREATED'
    | 'INCIDENT_UPDATED'
    | 'INCIDENT_APPROVED'
    | 'DISCREPANCY_FLAGGED'
    | 'AI_TOOL_CALLED';
  targetEntityId: string;
  targetEntityType: string;
  summary: string;
  diff?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
}

export interface AIAgentToolCall {
  toolName: string;
  args: Record<string, unknown>;
  timestamp: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  resultSummary?: string;
}

export interface AIMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM';
  timestamp: string;
  content: string;
  toolCalls?: AIAgentToolCall[];
  evidenceChips?: SourceEvidence[];
  proposedAction?: {
    actionType: 'CREATE_INCIDENT' | 'QUARANTINE_LOT' | 'REQUEST_ADDITIONAL_RECORDS';
    payload: Record<string, unknown>;
    requiresApproval: true;
    isApproved?: boolean;
  };
}

export type AIProviderStatus = 'CONNECTED' | 'PROCESSING' | 'FALLBACK_MODE' | 'UNAVAILABLE';
