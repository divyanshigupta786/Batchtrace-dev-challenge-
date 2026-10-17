import { NextResponse } from 'next/server';
import { traceStore } from '@/lib/store/traceStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documentId, action, reviewerName, reason } = body;

    if (!documentId || !action) {
      return NextResponse.json({ success: false, error: 'Document ID and action (APPROVE/REJECT) are required' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const doc = traceStore.approveDocument(documentId, reviewerName || 'Elena Rostova (QA Manager)');
      return NextResponse.json({ success: true, data: doc });
    } else if (action === 'REJECT') {
      const doc = traceStore.rejectDocument(documentId, reviewerName || 'Elena Rostova (QA Manager)', reason || 'Unverified fields');
      return NextResponse.json({ success: true, data: doc });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Review failed' }, { status: 500 });
  }
}
