import { NextRequest, NextResponse } from 'next/server';
import { demoReply, nextStep, onboardingQuestions, parseTools, type AgentDraft, type OnboardingStep } from '@/lib/agent-core';

// V1 webhook contract. It works in demo mode without secrets and becomes live
// when TELEGRAM_BOT_TOKEN + Supabase credentials are configured.
export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const update = await request.json().catch(() => null);
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = typeof message?.text === 'string' ? message.text.trim() : '';

  if (!chatId) return NextResponse.json({ ok: true, ignored: true });

  // Until persistence is connected, keep a safe stateless response.
  // Production persistence will store this state by Telegram user ID in Supabase.
  const step = (message?.from?.language_code ? 'name' : 'name') as OnboardingStep;
  const draft: AgentDraft = {};

  if (text === '/start') {
    return NextResponse.json({
      ok: true,
      chatId,
      reply: `Привет! 👋 Я ваш будущий персональный ИИ-помощник.\n\n${onboardingQuestions.name}`,
      nextStep: step,
      draft,
      demo: !process.env.SUPABASE_URL,
    });
  }

  return NextResponse.json({
    ok: true,
    chatId,
    reply: demoReply(text),
    detectedTools: parseTools(text),
    nextStep: nextStep(step),
    demo: !process.env.SUPABASE_URL,
  });
}
