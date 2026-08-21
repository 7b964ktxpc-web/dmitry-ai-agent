import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { conversationId, text } = await req.json();
    if (!conversationId || !text?.trim()) return NextResponse.json({ error: 'conversationId and text are required' }, { status: 400 });
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: conversation, error } = await db.from('conversations').select('id,client_id,control_mode').eq('id', conversationId).single();
    if (error || !conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    const { data: client } = await db.from('clients').select('external_id,channel').eq('id', conversation.client_id).single();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token || client?.channel !== 'telegram') return NextResponse.json({ error: 'Telegram is not configured' }, { status: 500 });
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: client.external_id, text: text.trim() }) });
    if (!tg.ok) return NextResponse.json({ error: 'Telegram send failed' }, { status: 502 });
    await db.from('messages').insert({ conversation_id: conversation.id, role: 'human', content: text.trim() });
    await db.from('conversations').update({ control_mode: 'human', status: 'human_active', assigned_to: 'dmitry', last_message_at: new Date().toISOString() }).eq('id', conversation.id);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Internal error' }, { status: 500 }); }
}
