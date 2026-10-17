import { NextResponse } from 'next/server';
import { traceStore } from '@/lib/store/traceStore';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: traceStore.incidents,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, targetLotOrBatch, targetType, severity, description, investigatorName, confirmedBatches, confirmedOrders } = body;

    if (!title || !targetLotOrBatch) {
      return NextResponse.json({ success: false, error: 'Title and target identifier are required' }, { status: 400 });
    }

    const incident = traceStore.createIncident({
      title,
      targetLotOrBatch,
      targetType: targetType || 'INGREDIENT_LOT',
      severity: severity || 'HIGH',
      description: description || `Investigation into flagged target ${targetLotOrBatch}`,
      investigatorName: investigatorName || 'Elena Rostova (QA Manager)',
      confirmedBatches,
      confirmedOrders,
    });

    return NextResponse.json({ success: true, data: incident });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create incident' }, { status: 500 });
  }
}
