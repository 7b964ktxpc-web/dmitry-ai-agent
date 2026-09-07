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
  name: 'Как вас зовут и чем вы занимаетесь? Можно коротко.',
  tasks: 'Какие задачи вы хотите делегировать помощнику? Расскажите своими словами.',
  style: 'Как с вами общаться? Например: коротко, по-человечески, без канцелярита.',
  memory: 'Что помощнику важно помнить о вас между разговорами?',
  tools: 'Какие возможности нужны? Например: поиск в интернете, напоминания, документы, календарь.',
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
  return Object.entries(dictionary)
    .filter(([key]) => text.toLowerCase().includes(key))
    .map(([, value]) => value);
}

export function demoReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('кто ты') || lower.includes('что ты умеешь')) {
    return 'Я ваш персональный ИИ-помощник. Могу запоминать важный контекст, помогать с задачами, искать информацию и подключать инструменты. Сначала настроим меня под вас.';
  }
  if (lower.includes('помни')) {
    return 'Запомню. В рабочей версии эта информация сохранится только в памяти вашего агента и будет доступна ему в следующих разговорах.';
  }
  return 'Принял 👍 В рабочей версии я разберу запрос, при необходимости использую подходящий инструмент, отвечу и сохраню полезный контекст в вашей персональной памяти.';
}
