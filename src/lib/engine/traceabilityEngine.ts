import {
  TraceResult,
  TraceNode,
  TraceEdge,
  SourceEvidence,
  QuantityDiscrepancy,
  MissingLink,
  CertaintyLevel,
  IngredientLot,
  ProductionBatch,
  FinishedLot,
  CustomerOrder,
  DocumentRecord
} from '@/types/traceability';

import {
  initialSuppliers,
  initialIngredientLots,
  initialProductionBatches,
  initialFinishedLots,
  initialCustomerOrders,
  initialDocuments
} from '@/lib/data/syntheticData';

export interface TraceEngineStore {
  suppliers?: typeof initialSuppliers;
  ingredientLots?: IngredientLot[];
  productionBatches?: ProductionBatch[];
  finishedLots?: FinishedLot[];
  customerOrders?: CustomerOrder[];
  documents?: DocumentRecord[];
}

export class TraceabilityEngine {
  private suppliers = initialSuppliers;
  private ingredientLots = initialIngredientLots;
  private productionBatches = initialProductionBatches;
  private finishedLots = initialFinishedLots;
  private customerOrders = initialCustomerOrders;
  private documents = initialDocuments;

  constructor(customStore?: TraceEngineStore) {
    if (customStore?.suppliers) this.suppliers = customStore.suppliers;
    if (customStore?.ingredientLots) this.ingredientLots = customStore.ingredientLots;
    if (customStore?.productionBatches) this.productionBatches = customStore.productionBatches;
    if (customStore?.finishedLots) this.finishedLots = customStore.finishedLots;
    if (customStore?.customerOrders) this.customerOrders = customStore.customerOrders;
    if (customStore?.documents) this.documents = customStore.documents;
  }

  /**
   * Forward Trace: From an Ingredient Lot downstream to Production Batches, Finished Lots, and Customer Orders.
   */
  public traceForward(ingredientLotId: string): TraceResult {
    const lot = this.ingredientLots.find(l => l.id.toLowerCase() === ingredientLotId.toLowerCase());

    if (!lot) {
      throw new Error(`Ingredient lot "${ingredientLotId}" not found in validated records.`);
    }

    const nodes: TraceNode[] = [];
    const edges: TraceEdge[] = [];
    const confirmedBatches: string[] = [];
    const affectedOrders: string[] = [];
    const possibleEdges: TraceEdge[] = [];
    const missingLinks: MissingLink[] = [];
    const discrepancies: QuantityDiscrepancy[] = [];
    let evidenceCount = 0;

    // 1. Root Node: Ingredient Lot
    const supplier = this.suppliers.find(s => s.id === lot.supplierId);
    const lotEvidence = this.findEvidenceForEntity(lot.id, 'INGREDIENT_LOT');
    evidenceCount += lotEvidence.length;

    const rootNode: TraceNode = {
      id: lot.id,
      type: 'INGREDIENT_LOT',
      label: `${lot.ingredientName} (${lot.id})`,
      code: lot.id,
      date: lot.receiptDate,
      status: lot.status,
      certainty: 'CONFIRMED',
      details: {
        'Ingredient': lot.ingredientName,
        'Supplier': supplier ? `${supplier.name} (${supplier.code})` : lot.supplierName,
        'Receipt Date': lot.receiptDate,
        'Quantity Received': `${lot.receivedQuantity} ${lot.unit}`,
        'PO Number': lot.poNumber,
        'Carrier Invoice': lot.carrierInvoice,
        'Flag Reason': lot.qualityFlagReason || 'None',
      },
      evidence: lotEvidence,
    };
    nodes.push(rootNode);

    // Supplier Node (upstream reference)
    if (supplier) {
      const supNode: TraceNode = {
        id: supplier.id,
        type: 'SUPPLIER',
        label: supplier.name,
        code: supplier.code,
        date: lot.receiptDate,
        status: 'VERIFIED',
        certainty: 'CONFIRMED',
        details: {
          'Country': supplier.country,
          'Certifications': supplier.certifications.join(', '),
          'Contact': supplier.contactEmail,
        },
        evidence: lotEvidence.filter(e => e.documentCategory === 'SUPPLIER_INVOICE'),
      };
      nodes.push(supNode);
      edges.push({
        id: `edge-${supplier.id}-${lot.id}`,
        source: supplier.id,
        target: lot.id,
        certainty: 'CONFIRMED',
        relationship: 'SUPPLIED_BY',
        rationale: 'Verified supplier invoice and receiving dock receipt match.',
      });
    }

    // 2. Identify Production Batches consuming this Lot
    const batches = this.productionBatches.filter(b => 
      b.inputs.some(inp => inp.ingredientLotId.toLowerCase() === lot.id.toLowerCase())
    );

    let totalLotConsumedAcrossBatches = 0;

    for (const batch of batches) {
      const input = batch.inputs.find(inp => inp.ingredientLotId.toLowerCase() === lot.id.toLowerCase());
      if (input) {
        totalLotConsumedAcrossBatches += input.quantityUsed;
      }

      // Check if batch record document is approved or pending review
      const isDocApproved = this.isDocumentApprovedForBatch(batch.id);
      const batchCertainty: CertaintyLevel = isDocApproved ? 'CONFIRMED' : 'POSSIBLE';

      if (batchCertainty === 'CONFIRMED') {
        confirmedBatches.push(batch.id);
      }

      const batchEvidence = this.findEvidenceForEntity(batch.id, 'PRODUCTION_BATCH');
      evidenceCount += batchEvidence.length;

      const batchNode: TraceNode = {
        id: batch.id,
        type: 'PRODUCTION_BATCH',
        label: `${batch.recipeName} (${batch.id})`,
        code: batch.id,
        date: batch.productionDate,
        status: batch.status,
        certainty: batchCertainty,
        details: {
          'Recipe': batch.recipeName,
          'Production Date': batch.productionDate,
          'Facility Line': batch.facilityLine,
          'Supervisor': batch.supervisor,
          'Lot Quantity Consumed': input ? `${input.quantityUsed} ${input.unit}` : 'Unknown',
          'Batch Output': `${batch.outputQuantity} ${batch.outputUnit}`,
        },
        evidence: batchEvidence,
        warnings: !isDocApproved ? ['Batch record document pending QA signature review.'] : undefined,
      };
      nodes.push(batchNode);

      const edge: TraceEdge = {
        id: `edge-${lot.id}-${batch.id}`,
        source: lot.id,
        target: batch.id,
        certainty: batchCertainty,
        relationship: 'CONSUMED_BY',
        quantityTransferred: input?.quantityUsed,
        unit: input?.unit,
        rationale: isDocApproved 
          ? `Verified consumption of ${input?.quantityUsed} ${input?.unit} in batch execution record.`
          : `Usage of ${input?.quantityUsed} ${input?.unit} indicated in draft/unapproved batch sheet.`,
      };
      edges.push(edge);
      if (batchCertainty === 'POSSIBLE') {
        possibleEdges.push(edge);
      }

      // 3. Trace from Batch to Finished Lots
      const finishedLotsForBatch = this.finishedLots.filter(fl => fl.productionBatchId === batch.id);

      if (finishedLotsForBatch.length === 0) {
        missingLinks.push({
          fromEntityId: batch.id,
          fromType: 'PRODUCTION_BATCH',
          expectedTargetType: 'FINISHED_LOT',
          reason: `No finished goods lot linked to completed batch ${batch.id}.`,
          remediationStep: 'Cross-check packaging line yield logs or ERP production release.',
        });
      }

      for (const fLot of finishedLotsForBatch) {
        const flEvidence = this.findEvidenceForEntity(fLot.id, 'FINISHED_LOT');
        evidenceCount += flEvidence.length;

        const flNode: TraceNode = {
          id: fLot.id,
          type: 'FINISHED_LOT',
          label: `${fLot.productName} (${fLot.id})`,
          code: fLot.id,
          date: fLot.packDate,
          status: fLot.status,
          certainty: batchCertainty,
          details: {
            'Product': fLot.productName,
            'Pack Date': fLot.packDate,
            'Best Before Date': fLot.bestBeforeDate,
            'Quantity Produced': `${fLot.quantityProduced} ${fLot.unit}`,
            'Quantity Shipped': `${fLot.quantityShipped} ${fLot.unit}`,
          },
          evidence: flEvidence,
        };
        nodes.push(flNode);

        edges.push({
          id: `edge-${batch.id}-${fLot.id}`,
          source: batch.id,
          target: fLot.id,
          certainty: batchCertainty,
          relationship: 'PRODUCED_INTO',
          quantityTransferred: fLot.quantityProduced,
          unit: fLot.unit,
        });

        // 4. Trace from Finished Lot to Customer Orders
        const matchingOrders = this.customerOrders.filter(order => 
          order.items.some(item => item.finishedLotId === fLot.id)
        );

        if (matchingOrders.length === 0 && fLot.quantityShipped > 0) {
          missingLinks.push({
            fromEntityId: fLot.id,
            fromType: 'FINISHED_LOT',
            expectedTargetType: 'CUSTOMER_ORDER',
            reason: `Finished lot ${fLot.id} indicates ${fLot.quantityShipped} ${fLot.unit} shipped, but customer order dispatch records are missing.`,
            remediationStep: 'Audit warehouse management system (WMS) shipping logs and carrier bills of lading.',
          });
        }

        for (const order of matchingOrders) {
          const item = order.items.find(i => i.finishedLotId === fLot.id);
          if (!affectedOrders.includes(order.id)) {
            affectedOrders.push(order.id);
          }

          const orderEvidence = this.findEvidenceForEntity(order.id, 'CUSTOMER_ORDER');
          evidenceCount += orderEvidence.length;

          const orderNode: TraceNode = {
            id: order.id,
            type: 'CUSTOMER_ORDER',
            label: `${order.customerName} (${order.orderNumber})`,
            code: order.orderNumber,
            date: order.dispatchDate,
            status: order.status,
            certainty: batchCertainty,
            details: {
              'Customer Name': order.customerName,
              'Customer Type': order.customerType,
              'Destination': order.destinationCity,
              'Carrier': order.carrierName,
              'Dispatch Date': order.dispatchDate,
              'Shipped Units': item ? `${item.quantityShipped} ${item.unit}` : 'Unknown',
            },
            evidence: orderEvidence,
          };

          if (!nodes.some(n => n.id === order.id)) {
            nodes.push(orderNode);
          }

          edges.push({
            id: `edge-${fLot.id}-${order.id}`,
            source: fLot.id,
            target: order.id,
            certainty: batchCertainty,
            relationship: 'DISPATCHED_TO',
            quantityTransferred: item?.quantityShipped,
            unit: item?.unit,
            rationale: `Shipped ${item?.quantityShipped} ${item?.unit} via ${order.carrierName}.`,
          });
        }
      }
    }

    // 5. Quantity Reconciliation for Root Lot
    if (totalLotConsumedAcrossBatches !== lot.receivedQuantity) {
      const diff = totalLotConsumedAcrossBatches - lot.receivedQuantity;
      discrepancies.push({
        entityId: lot.id,
        entityType: 'INGREDIENT_LOT',
        description: `Total consumed across production batches (${totalLotConsumedAcrossBatches} ${lot.unit}) differs from received quantity (${lot.receivedQuantity} ${lot.unit}) by ${Math.abs(diff)} ${lot.unit}.`,
        expectedAmount: lot.receivedQuantity,
        actualAmount: totalLotConsumedAcrossBatches,
        unit: lot.unit,
        difference: diff,
        severity: Math.abs(diff) > 20 ? 'HIGH' : 'MEDIUM',
      });
    }

    const isComplete = missingLinks.length === 0 && possibleEdges.length === 0;
    const completenessPercentage = Math.round(
      ((nodes.length - missingLinks.length) / Math.max(nodes.length, 1)) * 100
    );

    return {
      rootEntity: rootNode,
      direction: 'FORWARD',
      nodes,
      edges,
      confirmedBatches,
      affectedOrders,
      possibleEdges,
      missingLinks,
      quantityDiscrepancies: discrepancies,
      evidenceCount,
      isComplete,
      completenessPercentage: Math.max(0, Math.min(100, completenessPercentage)),
      investigationSummary: `Forward trace for lot ${lot.id} linked ${batches.length} production batch(es), ${nodes.filter(n => n.type === 'FINISHED_LOT').length} finished lot(s), and ${affectedOrders.length} customer order(s). ${discrepancies.length} quantity discrepancy and ${missingLinks.length} missing link(s) detected.`,
    };
  }

  /**
   * Backward Trace: From a Customer Order or Finished Lot upstream back to Batches, Ingredients, and Suppliers.
   */
  public traceBackward(entityId: string): TraceResult {
    // Check if entity is customer order
    const order = this.customerOrders.find(o => o.id.toLowerCase() === entityId.toLowerCase() || o.orderNumber.toLowerCase() === entityId.toLowerCase());
    
    // Check if entity is finished lot
    const finishedLot = this.finishedLots.find(fl => fl.id.toLowerCase() === entityId.toLowerCase());

    if (!order && !finishedLot) {
      throw new Error(`Entity "${entityId}" not found for backward tracing. Provide a valid Finished Lot ID or Customer Order.`);
    }

    const nodes: TraceNode[] = [];
    const edges: TraceEdge[] = [];
    const confirmedBatches: string[] = [];
    const affectedOrders: string[] = [];
    const possibleEdges: TraceEdge[] = [];
    const missingLinks: MissingLink[] = [];
    const discrepancies: QuantityDiscrepancy[] = [];
    let evidenceCount = 0;

    let targetFinishedLots: FinishedLot[] = [];

    if (order) {
      affectedOrders.push(order.id);
      const orderEvidence = this.findEvidenceForEntity(order.id, 'CUSTOMER_ORDER');
      evidenceCount += orderEvidence.length;

      const orderNode: TraceNode = {
        id: order.id,
        type: 'CUSTOMER_ORDER',
        label: `${order.customerName} (${order.orderNumber})`,
        code: order.orderNumber,
        date: order.dispatchDate,
        status: order.status,
        certainty: 'CONFIRMED',
        details: {
          'Customer': order.customerName,
          'Destination': order.destinationCity,
          'Carrier': order.carrierName,
          'Dispatch Date': order.dispatchDate,
        },
        evidence: orderEvidence,
      };
      nodes.push(orderNode);

      for (const item of order.items) {
        const fl = this.finishedLots.find(l => l.id === item.finishedLotId);
        if (fl) {
          targetFinishedLots.push(fl);
          edges.push({
            id: `edge-${fl.id}-${order.id}`,
            source: fl.id,
            target: order.id,
            certainty: 'CONFIRMED',
            relationship: 'DISPATCHED_IN_ORDER',
            quantityTransferred: item.quantityShipped,
            unit: item.unit,
          });
        } else {
          missingLinks.push({
            fromEntityId: order.id,
            fromType: 'CUSTOMER_ORDER',
            expectedTargetType: 'FINISHED_LOT',
            reason: `Order item references finished lot "${item.finishedLotId}" which is not found in validated inventory.`,
            remediationStep: 'Audit packing logs.',
          });
        }
      }
    } else if (finishedLot) {
      targetFinishedLots = [finishedLot];
    }

    const rootEntityNode: TraceNode = nodes[0] || {
      id: targetFinishedLots[0].id,
      type: 'FINISHED_LOT',
      label: `${targetFinishedLots[0].productName} (${targetFinishedLots[0].id})`,
      code: targetFinishedLots[0].id,
      date: targetFinishedLots[0].packDate,
      status: targetFinishedLots[0].status,
      certainty: 'CONFIRMED',
      details: {
        'Product': targetFinishedLots[0].productName,
        'Produced': `${targetFinishedLots[0].quantityProduced} ${targetFinishedLots[0].unit}`,
      },
      evidence: this.findEvidenceForEntity(targetFinishedLots[0].id, 'FINISHED_LOT'),
    };

    if (finishedLot && !nodes.some(n => n.id === finishedLot.id)) {
      nodes.push(rootEntityNode);
    }

    for (const fl of targetFinishedLots) {
      if (!nodes.some(n => n.id === fl.id)) {
        const flEvidence = this.findEvidenceForEntity(fl.id, 'FINISHED_LOT');
        evidenceCount += flEvidence.length;
        nodes.push({
          id: fl.id,
          type: 'FINISHED_LOT',
          label: `${fl.productName} (${fl.id})`,
          code: fl.id,
          date: fl.packDate,
          status: fl.status,
          certainty: 'CONFIRMED',
          details: {
            'Product': fl.productName,
            'Pack Date': fl.packDate,
            'Quantity Produced': `${fl.quantityProduced} ${fl.unit}`,
          },
          evidence: flEvidence,
        });
      }

      const batch = this.productionBatches.find(b => b.id === fl.productionBatchId);

      if (!batch) {
        missingLinks.push({
          fromEntityId: fl.id,
          fromType: 'FINISHED_LOT',
          expectedTargetType: 'PRODUCTION_BATCH',
          reason: `Finished lot ${fl.id} references missing batch ${fl.productionBatchId}.`,
          remediationStep: 'Inspect factory floor traveler cards.',
        });
        continue;
      }

      const isDocApproved = this.isDocumentApprovedForBatch(batch.id);
      const batchCertainty: CertaintyLevel = isDocApproved ? 'CONFIRMED' : 'POSSIBLE';
      if (batchCertainty === 'CONFIRMED') {
        confirmedBatches.push(batch.id);
      }

      const batchEvidence = this.findEvidenceForEntity(batch.id, 'PRODUCTION_BATCH');
      evidenceCount += batchEvidence.length;

      const batchNode: TraceNode = {
        id: batch.id,
        type: 'PRODUCTION_BATCH',
        label: `${batch.recipeName} (${batch.id})`,
        code: batch.id,
        date: batch.productionDate,
        status: batch.status,
        certainty: batchCertainty,
        details: {
          'Recipe': batch.recipeName,
          'Line': batch.facilityLine,
          'Supervisor': batch.supervisor,
        },
        evidence: batchEvidence,
      };

      if (!nodes.some(n => n.id === batch.id)) {
        nodes.push(batchNode);
      }

      edges.push({
        id: `edge-${batch.id}-${fl.id}`,
        source: batch.id,
        target: fl.id,
        certainty: batchCertainty,
        relationship: 'PRODUCED_INTO',
      });

      // Backward: Trace batch inputs to Ingredient Lots
      for (const input of batch.inputs) {
        const ingLot = this.ingredientLots.find(l => l.id === input.ingredientLotId);

        if (!ingLot) {
          missingLinks.push({
            fromEntityId: batch.id,
            fromType: 'PRODUCTION_BATCH',
            expectedTargetType: 'INGREDIENT_LOT',
            reason: `Batch ${batch.id} input lists lot "${input.ingredientLotId}" but lot details are missing from receiving logs.`,
            remediationStep: 'Request supplier certificate of analysis and receiving dock sheet.',
          });
          continue;
        }

        const lotEvidence = this.findEvidenceForEntity(ingLot.id, 'INGREDIENT_LOT');
        evidenceCount += lotEvidence.length;

        const lotNode: TraceNode = {
          id: ingLot.id,
          type: 'INGREDIENT_LOT',
          label: `${ingLot.ingredientName} (${ingLot.id})`,
          code: ingLot.id,
          date: ingLot.receiptDate,
          status: ingLot.status,
          certainty: 'CONFIRMED',
          details: {
            'Ingredient': ingLot.ingredientName,
            'Supplier': ingLot.supplierName,
            'Received Qty': `${ingLot.receivedQuantity} ${ingLot.unit}`,
            'Used in Batch': `${input.quantityUsed} ${input.unit}`,
            'Status': ingLot.status,
          },
          evidence: lotEvidence,
        };

        if (!nodes.some(n => n.id === ingLot.id)) {
          nodes.push(lotNode);
        }

        edges.push({
          id: `edge-${ingLot.id}-${batch.id}`,
          source: ingLot.id,
          target: batch.id,
          certainty: batchCertainty,
          relationship: 'CONSUMED_BY',
          quantityTransferred: input.quantityUsed,
          unit: input.unit,
        });

        // Supplier Node
        const supplier = this.suppliers.find(s => s.id === ingLot.supplierId);
        if (supplier && !nodes.some(n => n.id === supplier.id)) {
          nodes.push({
            id: supplier.id,
            type: 'SUPPLIER',
            label: supplier.name,
            code: supplier.code,
            date: ingLot.receiptDate,
            status: 'VERIFIED',
            certainty: 'CONFIRMED',
            details: {
              'Country': supplier.country,
              'Certifications': supplier.certifications.join(', '),
            },
            evidence: lotEvidence.filter(e => e.documentCategory === 'SUPPLIER_INVOICE'),
          });

          edges.push({
            id: `edge-${supplier.id}-${ingLot.id}`,
            source: supplier.id,
            target: ingLot.id,
            certainty: 'CONFIRMED',
            relationship: 'SUPPLIED_BY',
          });
        }
      }
    }

    const isComplete = missingLinks.length === 0;
    const completenessPercentage = Math.round(
      ((nodes.length - missingLinks.length) / Math.max(nodes.length, 1)) * 100
    );

    return {
      rootEntity: rootEntityNode,
      direction: 'BACKWARD',
      nodes,
      edges,
      confirmedBatches,
      affectedOrders,
      possibleEdges,
      missingLinks,
      quantityDiscrepancies: discrepancies,
      evidenceCount,
      isComplete,
      completenessPercentage: Math.max(0, Math.min(100, completenessPercentage)),
      investigationSummary: `Backward trace traced ${targetFinishedLots.length} finished lot(s) up through ${confirmedBatches.length} batch(es) to upstream ingredient lots and suppliers. Found ${nodes.length} connected entities.`,
    };
  }

  /**
   * Helper to retrieve source evidence supporting an entity from approved document records.
   */
  public findEvidenceForEntity(entityId: string, entityType: string): SourceEvidence[] {
    const evidence: SourceEvidence[] = [];

    for (const doc of this.documents) {
      for (const rec of doc.extractedRecords) {
        const matchesValue = String(rec.normalizedValue).toLowerCase() === entityId.toLowerCase() ||
          rec.originalText.toLowerCase().includes(entityId.toLowerCase());

        if (matchesValue) {
          evidence.push({
            documentId: doc.id,
            documentName: doc.filename,
            documentCategory: doc.category,
            rowOrPage: rec.sourceLocation.page 
              ? `Page ${rec.sourceLocation.page}, Col ${rec.sourceLocation.column || 'N/A'}`
              : `Row ${rec.sourceLocation.row}, Col ${rec.sourceLocation.column || 'N/A'}`,
            extractedText: rec.originalText,
            verifiedValue: String(rec.normalizedValue),
            timestamp: doc.uploadedAt,
          });
        }
      }
    }

    return evidence;
  }

  private isDocumentApprovedForBatch(batchId: string): boolean {
    const batchDoc = this.documents.find(d => 
      d.extractedRecords.some(r => 
        r.fieldName === 'BatchNumber' && String(r.normalizedValue).toLowerCase() === batchId.toLowerCase()
      )
    );
    if (!batchDoc) return true; // Default fallback to true if synthetic direct entry
    return batchDoc.status === 'APPROVED';
  }
}
