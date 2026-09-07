import { NextRequest, NextResponse } from 'next/server';
import { demoReply, nextStep, onboardingQuestions, parseTools, type OnboardingStep } from '@/lib/agent-core';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

async function sendTelegram(chatId: number | string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { sent: false };
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return { sent: response.ok };
}

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const update = await request.json().catch(() => null);
  const message = update?.message;
  const chatId = message?.chat?.id;
  const from = message?.from;
  const text = typeof message?.text === 'string' ? message.text.trim() : '';
  if (!chatId || !from) return NextResponse.json({ ok: true, ignored: true });

  const supabase = getSupabaseAdmin();
  let reply = '';
  let currentStep: OnboardingStep = 'name';
  let userId: string | undefined;
  let agentId: string | undefined;

  if (supabase) {
    const { data: user } = await supabase.from('users').upsert({
      telegram_id: from.id,
      username: from.username ?? null,
      first_name: from.first_name ?? null,
      last_name: from.last_name ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'telegram_id' }).select().single();

    if (user) {
      userId = user.id;
      const { data: existingAgent } = await supabase.from('agents').select('*').eq('user_id', user.id).maybeSingle();
      if (existingAgent) agentId = existingAgent.id;
      else {
        const { data: newAgent } = await supabase.from('agents').insert({ user_id: user.id, name: from.first_name ? `${from.first_name} AI` : 'Мой помощник' }).select().single();
        agentId = newAgent?.id;
        if (agentId) await supabase.from('agent_profiles').insert({ agent_id: agentId });
      }

      if (text === '/start') {
        if (agentId) {
          await supabase.from('agent_profiles').update({ onboarding_answers: {}, updated_at: new Date().toISOString() }).eq('agent_id', agentId);
          await supabase.from('agents').update({ status: 'setup', updated_at: new Date().toISOString() }).eq('id', agentId);
        }
        await supabase.from('users').update({ onboarding_completed: false, updated_at: new Date().toISOString() }).eq('id', userId);
        currentStep = 'name';
        reply = `Привет, ${from.first_name ?? ''}! 👋\n\nЯ помогу создать твоего персонального ИИ-помощника.\n\n${onboardingQuestions.name}`.trim();
      } else if (!text) {
        reply = 'Напиши сообщение текстом — я подскажу, что делать дальше 🙂';
      } else {
        const { data: profile } = agentId
          ? await supabase.from('agent_profiles').select('onboarding_answers').eq('agent_id', agentId).maybeSingle()
          : { data: null };
        const answers = (profile?.onboarding_answers ?? {}) as Record<string, string>;
        const keys: OnboardingStep[] = ['name', 'tasks', 'style', 'memory', 'tools'];
        currentStep = keys.find((key) => !answers[key]) ?? 'done';

        if (currentStep !== 'done') {
          answers[currentStep] = text;
          const upcoming = nextStep(currentStep);
          await supabase.from('agent_profiles').update({ onboarding_answers: answers, updated_at: new Date().toISOString() }).eq('agent_id', agentId);
          if (upcoming === 'done') {
            await supabase.from('agents').update({ status: 'online', updated_at: new Date().toISOString() }).eq('id', agentId);
            await supabase.from('users').update({ onboarding_completed: true, updated_at: new Date().toISOString() }).eq('id', userId);
            reply = 'Готово! 🎉\n\nЯ настроил твоего персонального помощника. Теперь просто пиши обычными сообщениями — задачи, вопросы, идеи. По мере работы я буду запоминать полезный контекст и подключать нужные инструменты.';
          } else reply = onboardingQuestions[upcoming];
          currentStep = upcoming;
        } else {
          reply = demoReply(text);
          if (agentId) {
            const { data: conversation } = await supabase.from('conversations').upsert({ agent_id: agentId, channel: 'telegram', external_chat_id: String(chatId), updated_at: new Date().toISOString() }, { onConflict: 'agent_id,external_chat_id' }).select().single();
            if (conversation) {
              await supabase.from('messages').insert([{ conversation_id: conversation.id, role: 'user', content: text }, { conversation_id: conversation.id, role: 'assistant', content: reply }]);
              await supabase.from('usage_events').insert({ agent_id: agentId, event_type: 'message' });
            }
          }
        }
      }
    }
  } else {
    reply = text === '/start' ? `Привет! 👋\n\nЯ помогу создать твоего персонального ИИ-помощника.\n\n${onboardingQuestions.name}` : demoReply(text);
  }

  const telegram = await sendTelegram(chatId, reply);
  return NextResponse.json({ ok: true, chatId, reply, nextStep: currentStep, detectedTools: parseTools(text), persisted: Boolean(supabase), telegramSent: telegram.sent });
}
