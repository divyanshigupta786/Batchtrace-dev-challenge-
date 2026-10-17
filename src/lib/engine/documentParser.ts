import { DocumentRecord, ExtractedFieldRecord } from '@/types/traceability';

export interface ParseOptions {
  filename: string;
  fileSizeBytes: number;
  fileContent: string; // Text content or base64/CSV text
  uploaderName: string;
  orgId: string;
}

export class DocumentParser {
  /**
   * Process and extract structured food traceability records from incoming file text or CSV.
   */
  public static parseDocument(options: ParseOptions): DocumentRecord {
    const { filename, fileSizeBytes, fileContent, uploaderName, orgId } = options;
    const docId = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
    const extension = filename.split('.').pop()?.toUpperCase() || 'TXT';

    let category: DocumentRecord['category'] = 'SUPPLIER_INVOICE';
    const lowerContent = fileContent.toLowerCase();

    if (lowerContent.includes('invoice') || lowerContent.includes('gross wt') || lowerContent.includes('commercial invoice')) {
      category = 'SUPPLIER_INVOICE';
    } else if (lowerContent.includes('receiving') || lowerContent.includes('dock') || lowerContent.includes('qc_status')) {
      category = 'RECEIVING_LOG';
    } else if (lowerContent.includes('batch') || lowerContent.includes('formula') || lowerContent.includes('baking line') || lowerContent.includes('extruder')) {
      category = 'BATCH_RECORD';
    } else if (lowerContent.includes('manifest') || lowerContent.includes('bill of lading') || lowerContent.includes('bol') || lowerContent.includes('consignee')) {
      category = 'DISPATCH_MANIFEST';
    } else if (lowerContent.includes('pack') || lowerContent.includes('finished')) {
      category = 'FINISHED_PACK_SHEET';
    }

    const extractedRecords: ExtractedFieldRecord[] = [];
    const lines = fileContent.split('\n').map(l => l.trim()).filter(Boolean);

    // Deterministic field patterns:
    lines.forEach((line, index) => {
      // Lot Pattern (e.g. Lot: L-204 or Lot #: L-204)
      const lotMatch = line.match(/(?:lot\s*(?:#|id|number)?\s*[:\-=]\s*)([A-Z0-9\-]+)/i);
      if (lotMatch) {
        extractedRecords.push({
          id: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
          documentId: docId,
          fieldName: 'IngredientLotNumber',
          originalText: line,
          normalizedValue: lotMatch[1].trim().toUpperCase(),
          sourceLocation: { row: index + 1, column: 'Lot_Identifier' },
          confidence: 0.98,
          extractionMethod: 'DETERMINISTIC_PARSER',
          validationStatus: 'VALID',
          reviewed: false,
        });
      }

      // Batch Pattern (e.g. Batch: PB-031)
      const batchMatch = line.match(/(?:batch\s*(?:#|id|number)?\s*[:\-=]\s*)([A-Z0-9\-]+)/i);
      if (batchMatch) {
        extractedRecords.push({
          id: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
          documentId: docId,
          fieldName: 'BatchNumber',
          originalText: line,
          normalizedValue: batchMatch[1].trim().toUpperCase(),
          sourceLocation: { row: index + 1, column: 'Batch_Identifier' },
          confidence: 0.99,
          extractionMethod: 'DETERMINISTIC_PARSER',
          validationStatus: 'VALID',
          reviewed: false,
        });
      }

      // Quantity pattern (e.g. 1,200 KG or 800.0 kg or 600 Pouches)
      const qtyMatch = line.match(/([\d,]+(?:\.\d+)?)\s*(kg|kilograms|lbs|pouches|cartons|cases|units)/i);
      if (qtyMatch) {
        const rawNum = parseFloat(qtyMatch[1].replace(/,/g, ''));
        const unit = qtyMatch[2].toLowerCase();
        extractedRecords.push({
          id: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
          documentId: docId,
          fieldName: 'QuantityExtracted',
          originalText: line,
          normalizedValue: rawNum,
          sourceLocation: { row: index + 1, column: 'Quantity_Measurement' },
          confidence: 0.94,
          extractionMethod: 'DETERMINISTIC_PARSER',
          validationStatus: 'VALID',
          validationMessage: `Normalized to ${rawNum} ${unit}`,
          reviewed: false,
        });
      }

      // PO pattern (e.g. PO: PO-88210)
      const poMatch = line.match(/(?:po(?:\s*ref)?\s*[:\-=]\s*)([A-Z0-9\-]+)/i);
      if (poMatch) {
        extractedRecords.push({
          id: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
          documentId: docId,
          fieldName: 'PurchaseOrderNumber',
          originalText: line,
          normalizedValue: poMatch[1].trim().toUpperCase(),
          sourceLocation: { row: index + 1, column: 'PO_Reference' },
          confidence: 0.97,
          extractionMethod: 'DETERMINISTIC_PARSER',
          validationStatus: 'VALID',
          reviewed: false,
        });
      }
    });

    // If few fields extracted, add AI assistance extraction
    if (extractedRecords.length === 0) {
      extractedRecords.push({
        id: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
        documentId: docId,
        fieldName: 'RawDocumentSummary',
        originalText: lines.slice(0, 3).join(' | '),
        normalizedValue: 'General Ingestion Record',
        sourceLocation: { row: 1, column: 'General_Content' },
        confidence: 0.85,
        extractionMethod: 'AI_EXTRACTOR',
        validationStatus: 'WARNING',
        validationMessage: 'Automatic deterministic matching low confidence; manual field validation recommended.',
        reviewed: false,
      });
    }

    return {
      id: docId,
      orgId,
      filename,
      fileType: extension as DocumentRecord['fileType'],
      category,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      uploaderName,
      fileSizeBytes,
      status: 'REVIEW_REQUIRED',
      recordCount: extractedRecords.length,
      extractedRecords,
      rawTextPreview: fileContent.slice(0, 2000),
    };
  }
}
