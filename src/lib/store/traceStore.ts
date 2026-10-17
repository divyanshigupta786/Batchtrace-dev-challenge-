import {
  DocumentRecord,
  IngredientLot,
  ProductionBatch,
  FinishedLot,
  CustomerOrder,
  IncidentReport,
  AuditLogEntry,
  IncidentStatus
} from '@/types/traceability';
import {
  initialSuppliers,
  initialIngredients,
  initialIngredientLots,
  initialProductionBatches,
  initialFinishedProducts,
  initialFinishedLots,
  initialCustomerOrders,
  initialDocuments,
  initialIncidents,
  initialAuditLogs,
  DEMO_ORG_ID
} from '@/lib/data/syntheticData';

// Singleton in-memory store for server/client runtime
class TraceStore {
  public suppliers = [...initialSuppliers];
  public ingredients = [...initialIngredients];
  public ingredientLots = [...initialIngredientLots];
  public productionBatches = [...initialProductionBatches];
  public finishedProducts = [...initialFinishedProducts];
  public finishedLots = [...initialFinishedLots];
  public customerOrders = [...initialCustomerOrders];
  public documents = [...initialDocuments];
  public incidents = [...initialIncidents];
  public auditLogs = [...initialAuditLogs];

  public resetToDefault() {
    this.suppliers = [...initialSuppliers];
    this.ingredients = [...initialIngredients];
    this.ingredientLots = [...initialIngredientLots];
    this.productionBatches = [...initialProductionBatches];
    this.finishedProducts = [...initialFinishedProducts];
    this.finishedLots = [...initialFinishedLots];
    this.customerOrders = [...initialCustomerOrders];
    this.documents = [...initialDocuments];
    this.incidents = [...initialIncidents];
    this.auditLogs = [...initialAuditLogs];
    this.recordAudit('Elena Rostova', 'SYSTEM_RESET', 'ORGANIZATION', DEMO_ORG_ID, 'Reset organization state to baseline synthetic demo dataset.');
  }

  public recordAudit(
    actorName: string,
    action: AuditLogEntry['action'] | 'SYSTEM_RESET',
    targetEntityType: string,
    targetEntityId: string,
    summary: string,
    diff?: AuditLogEntry['diff']
  ) {
    const entry: AuditLogEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      orgId: DEMO_ORG_ID,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: {
        name: actorName,
        email: `${actorName.toLowerCase().replace(/\s+/g, '.')}@meadowpantry.example.com`,
        role: 'Authorized User',
      },
      action: action as AuditLogEntry['action'],
      targetEntityId,
      targetEntityType,
      summary,
      diff,
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  public addDocument(doc: DocumentRecord) {
    this.documents.unshift(doc);
    this.recordAudit(doc.uploaderName, 'DOCUMENT_UPLOAD', 'DOCUMENT_RECORD', doc.id, `Uploaded document ${doc.filename} (${doc.category})`);
    return doc;
  }

  public approveDocument(docId: string, reviewerName: string) {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) throw new Error(`Document ${docId} not found`);
    const beforeStatus = doc.status;
    doc.status = 'APPROVED';
    doc.extractedRecords.forEach(r => {
      r.reviewed = true;
      r.reviewedBy = reviewerName;
    });
    this.recordAudit(reviewerName, 'RECORD_APPROVED', 'DOCUMENT_RECORD', doc.id, `Approved document ${doc.filename} and confirmed all extracted fields.`, {
      before: { status: beforeStatus },
      after: { status: 'APPROVED' },
    });
    return doc;
  }

  public rejectDocument(docId: string, reviewerName: string, reason: string) {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) throw new Error(`Document ${docId} not found`);
    doc.status = 'REJECTED';
    doc.errorMessage = reason;
    this.recordAudit(reviewerName, 'RECORD_REJECTED', 'DOCUMENT_RECORD', doc.id, `Rejected document ${doc.filename}: ${reason}`);
    return doc;
  }

  public createIncident(data: {
    title: string;
    targetLotOrBatch: string;
    targetType: IncidentReport['targetType'];
    severity: IncidentReport['severity'];
    description: string;
    investigatorName: string;
    confirmedBatches?: string[];
    confirmedOrders?: string[];
  }): IncidentReport {
    const incidentNumber = `INC-${String(this.incidents.length + 1).padStart(3, '0')}`;
    const newInc: IncidentReport = {
      id: `INC-2026-${String(this.incidents.length + 1).padStart(3, '0')}`,
      orgId: DEMO_ORG_ID,
      incidentNumber,
      title: data.title,
      targetLotOrBatch: data.targetLotOrBatch,
      targetType: data.targetType,
      severity: data.severity,
      status: 'INVESTIGATING',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      investigatorName: data.investigatorName,
      description: data.description,
      confirmedBatches: data.confirmedBatches || [],
      confirmedOrders: data.confirmedOrders || [],
      possibleLinksCount: 1,
      quantityDiscrepanciesCount: 1,
      missingRecordsCount: 0,
      evidenceItems: [],
      recommendedSteps: [
        `Isolate target lot ${data.targetLotOrBatch} across all facilities.`,
        'Verify forward traceability downstream dispatch orders.',
        'Obtain independent laboratory confirmation.',
      ],
      limitations: [
        'Investigation generated with active deterministic audit records.',
      ],
    };

    this.incidents.unshift(newInc);
    this.recordAudit(data.investigatorName, 'INCIDENT_CREATED', 'INCIDENT_REPORT', newInc.id, `Created incident ${incidentNumber}: ${data.title}`);
    return newInc;
  }

  public updateIncidentStatus(
    incidentId: string,
    newStatus: IncidentStatus,
    actorName: string,
    notes?: string
  ): IncidentReport {
    const inc = this.incidents.find(i => i.id === incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found`);

    const oldStatus = inc.status;
    inc.status = newStatus;
    inc.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (newStatus === 'APPROVED') {
      inc.approvedBy = actorName;
      inc.approvedAt = inc.updatedAt;
      inc.humanSignOffNotes = notes || 'Formally approved based on validated evidence records.';
    }

    this.recordAudit(actorName, 'INCIDENT_APPROVED', 'INCIDENT_REPORT', inc.id, `Advanced incident ${inc.incidentNumber} status from ${oldStatus} to ${newStatus}.`, {
      before: { status: oldStatus },
      after: { status: newStatus, notes },
    });

    return inc;
  }
}

// Global store instance
export const traceStore = new TraceStore();
