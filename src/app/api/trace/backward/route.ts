import { NextResponse } from 'next/server';
import { TraceabilityEngine } from '@/lib/engine/traceabilityEngine';
import { traceStore } from '@/lib/store/traceStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId') || 'FP-101';

    // If internal FastAPI service binding is configured, call it
    if (process.env.FASTAPI_BACKEND_URL) {
      try {
        const targetUrl = new URL('/api/trace/backward', process.env.FASTAPI_BACKEND_URL);
        const res = await fetch(targetUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_id: entityId }),
          cache: 'no-store',
        });
        if (res.ok) {
          const pyData = await res.json();
          return NextResponse.json({ success: true, data: pyData, source: 'fastapi' });
        }
      } catch (e) {
        console.warn('FastAPI backend service call failed, falling back to local engine:', e);
      }
    }

    const engine = new TraceabilityEngine({
      suppliers: traceStore.suppliers,
      ingredientLots: traceStore.ingredientLots,
      productionBatches: traceStore.productionBatches,
      finishedLots: traceStore.finishedLots,
      customerOrders: traceStore.customerOrders,
      documents: traceStore.documents,
    });

    const result = engine.traceBackward(entityId);
    return NextResponse.json({ success: true, data: result, source: 'local' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Backward trace failed' },
      { status: 400 }
    );
  }
}
