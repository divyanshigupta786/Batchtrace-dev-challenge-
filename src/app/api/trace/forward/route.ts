import { NextResponse } from 'next/server';
import { TraceabilityEngine } from '@/lib/engine/traceabilityEngine';
import { traceStore } from '@/lib/store/traceStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lotId = searchParams.get('lotId') || 'L-204';

    // If internal FastAPI service binding is configured, call it
    const backendUrl = process.env.BACKEND_URL || process.env.FASTAPI_BACKEND_URL;
    if (backendUrl) {
      try {
        const targetUrl = new URL('/api/trace/forward', backendUrl);
        const res = await fetch(targetUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lot_id: lotId }),
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

    const result = engine.traceForward(lotId);
    return NextResponse.json({ success: true, data: result, source: 'local' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Trace failed' },
      { status: 400 }
    );
  }
}
