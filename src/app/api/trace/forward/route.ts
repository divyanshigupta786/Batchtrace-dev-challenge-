import { NextResponse } from 'next/server';
import { TraceabilityEngine } from '@/lib/engine/traceabilityEngine';
import { traceStore } from '@/lib/store/traceStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lotId = searchParams.get('lotId') || 'L-204';

    const engine = new TraceabilityEngine({
      suppliers: traceStore.suppliers,
      ingredientLots: traceStore.ingredientLots,
      productionBatches: traceStore.productionBatches,
      finishedLots: traceStore.finishedLots,
      customerOrders: traceStore.customerOrders,
      documents: traceStore.documents,
    });

    const result = engine.traceForward(lotId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Trace failed' },
      { status: 400 }
    );
  }
}
