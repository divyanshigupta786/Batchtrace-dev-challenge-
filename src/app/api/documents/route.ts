import { NextResponse } from 'next/server';
import { traceStore } from '@/lib/store/traceStore';
import { DocumentParser } from '@/lib/engine/documentParser';
import { DEMO_ORG_ID } from '@/lib/data/syntheticData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: traceStore.documents,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, fileContent, uploaderName } = body;

    if (!filename || !fileContent) {
      return NextResponse.json({ success: false, error: 'Filename and file content are required' }, { status: 400 });
    }

    const uploader = uploaderName || 'Elena Rostova (QA Manager)';

    // Optional coordinate extraction via internal FastAPI service binding
    if (process.env.FASTAPI_BACKEND_URL) {
      try {
        const targetUrl = new URL('/api/extract', process.env.FASTAPI_BACKEND_URL);
        const res = await fetch(targetUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename,
            raw_text: fileContent,
            uploader_name: uploader,
          }),
          cache: 'no-store',
        });
        if (res.ok) {
          const pyExtract = await res.json();
          // Merge with document store
          const doc = DocumentParser.parseDocument({
            filename,
            fileSizeBytes: fileContent.length,
            fileContent,
            uploaderName: uploader,
            orgId: DEMO_ORG_ID,
          });
          doc.category = (pyExtract.detected_category as any) || doc.category;
          traceStore.addDocument(doc);
          return NextResponse.json({ success: true, data: doc, extractionSource: 'fastapi' });
        }
      } catch (e) {
        console.warn('FastAPI document extraction failed, using local parser:', e);
      }
    }

    const doc = DocumentParser.parseDocument({
      filename,
      fileSizeBytes: fileContent.length,
      fileContent,
      uploaderName: uploader,
      orgId: DEMO_ORG_ID,
    });

    traceStore.addDocument(doc);

    return NextResponse.json({ success: true, data: doc, extractionSource: 'local' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to process document' }, { status: 500 });
  }
}
