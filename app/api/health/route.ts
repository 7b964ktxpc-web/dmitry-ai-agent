import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'universal-ai-agent',
    mode: process.env.SUPABASE_URL ? 'connected-configured' : 'demo',
    timestamp: new Date().toISOString(),
  });
}
