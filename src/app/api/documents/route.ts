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

    const doc = DocumentParser.parseDocument({
      filename,
      fileSizeBytes: fileContent.length,
      fileContent,
      uploaderName: uploaderName || 'Elena Rostova (QA Manager)',
      orgId: DEMO_ORG_ID,
    });

    traceStore.addDocument(doc);

    return NextResponse.json({ success: true, data: doc });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to process document' }, { status: 500 });
  }
}
