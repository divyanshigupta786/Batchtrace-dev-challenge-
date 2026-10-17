import { NextResponse } from 'next/server';
import { traceStore } from '@/lib/store/traceStore';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: traceStore.auditLogs,
  });
}
