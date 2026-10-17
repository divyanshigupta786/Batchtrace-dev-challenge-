import { NextResponse } from 'next/server';
import { AIAgentModelAdapter } from '@/lib/ai/modelAdapter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, history, providerConfig } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ success: false, error: 'User prompt is required' }, { status: 400 });
    }

    const adapter = new AIAgentModelAdapter();
    const result = await adapter.processInvestigation({
      userPrompt: prompt,
      conversationHistory: history,
      providerConfig,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Investigation processing error' },
      { status: 500 }
    );
  }
}
