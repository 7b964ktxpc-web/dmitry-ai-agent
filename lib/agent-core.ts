export type OnboardingStep = 'name' | 'tasks' | 'style' | 'memory' | 'tools' | 'done';

export type AgentDraft = {
  name?: string;
  occupation?: string;
  goals?: string;
  communicationStyle?: string;
  memory?: string;
  tools?: string[];
};

export const onboardingQuestions: Record<Exclude<OnboardingStep, 'done'>, string> = {
  name: '👋 Давай познакомимся.\n\nНапиши, как тебя зовут и чем занимаешься. Можно обычными словами.\n\n💡 Например: «Я Дмитрий, занимаюсь бизнесом и проектами» или «Я Анна, работаю бухгалтером».',
  tasks: '🎯 Теперь расскажи, с чем тебе нужен помощник.\n\nНе надо придумывать промпт — просто перечисли, что хочешь поручать.\n\n💡 Например: «Писать сообщения клиентам, планировать день, искать информацию и помогать с документами».',
  style: '✍️ Как тебе удобнее общаться со мной?\n\n💡 Можно написать: «Коротко и по делу», «По-человечески, без канцелярита», «С юмором», «Подробно, когда тема сложная». Можно выбрать сразу несколько пожеланий.',
  memory: '🧠 Что мне важно помнить о тебе между разговорами?\n\n💡 Например: «Запоминай мои проекты, цели, предпочтения, важные даты и рабочие правила».\n\nЕсли ничего особенного — напиши «Ничего особенного».',
  tools: '🛠️ Какие возможности тебе нужны?\n\n💡 Можно написать несколько: «поиск в интернете, напоминания, документы, календарь, калькулятор, создание изображений».\n\nЕсли пока не знаешь — напиши «Пока без инструментов».',
};

export function nextStep(step: OnboardingStep): OnboardingStep {
  const order: OnboardingStep[] = ['name', 'tasks', 'style', 'memory', 'tools', 'done'];
  return order[Math.min(order.indexOf(step) + 1, order.length - 1)];
}

export function parseTools(text: string): string[] {
  const dictionary: Record<string, string> = {
    'поиск': 'web_search',
    'интернет': 'web_search',
    'калькулятор': 'calculator',
    'напомин': 'reminders',
    'документ': 'documents',
    'файл': 'documents',
    'календар': 'calendar',
    'изображ': 'image_generation',
  };
  return [...new Set(Object.entries(dictionary)
    .filter(([key]) => text.toLowerCase().includes(key))
    .map(([, value]) => value))];
}

export function demoReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('кто ты') || lower.includes('что ты умеешь')) {
    return 'Я твой персональный ИИ-помощник. Могу помогать с задачами, запоминать полезный контекст, искать информацию и работать с подключёнными инструментами. 🤝';
  }
  if (lower.includes('помни')) {
    return 'Запомню 👍 В рабочей версии эта информация сохранится отдельно в памяти твоего агента и будет использоваться в следующих разговорах.';
  }
  return 'Принял 👍 В рабочей версии я разберу запрос, при необходимости выберу подходящий инструмент, отвечу и сохраню полезный контекст в памяти твоего агента.';
}
