import { NextResponse } from 'next/server';
import { traceStore } from '@/lib/store/traceStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = traceStore.incidents.find(i => i.id === id || i.incidentNumber === id);

  if (!incident) {
    return NextResponse.json({ success: false, error: 'Incident not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: incident });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, actorName, notes } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const updated = traceStore.updateIncidentStatus(
      id,
      status,
      actorName || 'Elena Rostova (QA Manager)',
      notes
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Update failed' }, { status: 500 });
  }
}
