import { NextResponse } from 'next/server';
import { traceStore } from '@/lib/store/traceStore';

export async function POST() {
  traceStore.resetToDefault();
  return NextResponse.json({
    success: true,
    message: 'Reset organization state to baseline synthetic demo dataset successfully.',
  });
}
