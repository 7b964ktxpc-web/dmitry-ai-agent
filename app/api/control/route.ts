import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { conversationId, mode } = await req.json();
    if (!conversationId || !['human', 'ai', 'pause'].includes(mode)) {
      return NextResponse.json({ error: 'conversationId and valid mode are required' }, { status: 400 });
    }
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const values = mode === 'human'
      ? { control_mode: 'human', status: 'human_active', assigned_to: 'dmitry' }
      : mode === 'ai'
        ? { control_mode: 'ai', status: 'ai_active', assigned_to: null }
        : { control_mode: 'pause', status: 'paused', assigned_to: 'dmitry' };
    const { data, error } = await db.from('conversations').update(values).eq('id', conversationId).select('id,control_mode,status,assigned_to').single();
    if (error || !data) return NextResponse.json({ error: error?.message || 'Conversation not found' }, { status: 404 });
    return NextResponse.json({ ok: true, conversation: data });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
