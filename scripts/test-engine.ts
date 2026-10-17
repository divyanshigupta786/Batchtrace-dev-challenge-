import { TraceabilityEngine } from '../src/lib/engine/traceabilityEngine';
import { DocumentParser } from '../src/lib/engine/documentParser';
import { AIAgentModelAdapter } from '../src/lib/ai/modelAdapter';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log('\n--- Running BatchTrace Deterministic Engine & AI Verification Tests ---');

  // Test 1: Forward Trace from Flagged Lot L-204
  const engine = new TraceabilityEngine();
  const forwardResult = engine.traceForward('L-204');

  assert(forwardResult.rootEntity.id === 'L-204', 'Root entity is L-204');
  assert(forwardResult.confirmedBatches.includes('PB-031'), 'Forward trace linked approved Batch PB-031');
  assert(forwardResult.nodes.some(n => n.id === 'PB-032'), 'Forward trace linked Batch PB-032');
  assert(forwardResult.nodes.some(n => n.id === 'FP-101'), 'Forward trace linked Finished Lot FP-101');
  assert(forwardResult.nodes.some(n => n.id === 'FP-102'), 'Forward trace linked Finished Lot FP-102');
  assert(forwardResult.affectedOrders.includes('ORD-101'), 'Affected orders include ORD-101 (Whole Foods)');
  assert(forwardResult.affectedOrders.includes('ORD-102'), 'Affected orders include ORD-102 (FreshDirect)');
  assert(forwardResult.affectedOrders.includes('ORD-103'), 'Affected orders include ORD-103 (Trader Joes)');
  assert(forwardResult.affectedOrders.includes('ORD-104'), 'Affected orders include ORD-104 (Apex)');
  
  // Test 2: Mass balance discrepancy detection
  assert(forwardResult.quantityDiscrepancies.length === 1, 'Detected exactly 1 quantity discrepancy on L-204');
  assert(forwardResult.quantityDiscrepancies[0].difference === 50, 'Detected 50 kg negative variance (1200 received vs 1250 consumed)');

  // Test 3: Backward Trace from Finished Lot FP-101
  const backwardResult = engine.traceBackward('FP-101');
  assert(backwardResult.rootEntity.id === 'FP-101', 'Backward trace root is FP-101');
  assert(backwardResult.nodes.some(n => n.id === 'PB-031'), 'Traced back to Batch PB-031');
  assert(backwardResult.nodes.some(n => n.id === 'L-204'), 'Traced back to Lot L-204 (Oats)');
  assert(backwardResult.nodes.some(n => n.id === 'L-205'), 'Traced back to Lot L-205 (Honey)');
  assert(backwardResult.nodes.some(n => n.id === 'SUP-01'), 'Traced back to Supplier Greenfield Ingredients');

  // Test 4: Document Parser Extraction
  const sampleDocText = `COMMERCIAL INVOICE
Supplier: Greenfield Ingredients Co.
PO Ref: PO-88299
Lot #: L-999
Quantity: 500.0 kg`;

  const parsedDoc = DocumentParser.parseDocument({
    filename: 'test_invoice.txt',
    fileSizeBytes: sampleDocText.length,
    fileContent: sampleDocText,
    uploaderName: 'Test QA',
    orgId: 'test-org',
  });

  assert(parsedDoc.category === 'SUPPLIER_INVOICE', 'Document category classified as SUPPLIER_INVOICE');
  assert(parsedDoc.extractedRecords.some(r => r.fieldName === 'IngredientLotNumber' && r.normalizedValue === 'L-999'), 'Extracted Lot L-999 with exact coordinates');
  assert(parsedDoc.extractedRecords.some(r => r.fieldName === 'QuantityExtracted' && r.normalizedValue === 500), 'Extracted and normalized quantity to 500');

  // Test 5: AI Model Adapter Controlled Tool Execution
  const aiAdapter = new AIAgentModelAdapter();
  const aiResponse = await aiAdapter.processInvestigation({
    userPrompt: 'Which products used ingredient lot L-204?',
  });

  assert(aiResponse.message.toolCalls?.length === 4, 'AI agent executed 4 controlled tools for Lot L-204');
  assert(aiResponse.message.content.includes('PB-031') && aiResponse.message.content.includes('PB-032'), 'AI response grounded in actual batches PB-031 and PB-032');
  assert(aiResponse.message.content.includes('50 kg'), 'AI response noted 50 kg discrepancy');
  assert(aiResponse.message.proposedAction?.actionType === 'CREATE_INCIDENT', 'AI agent proposed formal human sign-off action');

  console.log('\n🎉 ALL 5 TEST SUITES PASSED! Traceability logic, discrepancy detection, document parsing, and AI tool controls verified.\n');
}

runTests();
