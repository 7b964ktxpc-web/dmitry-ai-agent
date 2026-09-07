'use client';

import { useMemo, useState } from 'react';

type Agent = {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'setup';
  tasks: number;
  messages: number;
  memory: number;
};

const seedAgents: Agent[] = [
  { id: 'demo-1', name: 'Дмитрий', role: 'Универсальный помощник', status: 'online', tasks: 8, messages: 1842, memory: 126 },
  { id: 'demo-2', name: 'Анна', role: 'Помощник по родительскому комитету', status: 'online', tasks: 5, messages: 321, memory: 42 },
  { id: 'demo-3', name: 'Иван', role: 'Бизнес-помощник', status: 'setup', tasks: 3, messages: 94, memory: 18 },
];

const onboarding = [
  ['👋', 'Знакомство', 'Кто вы и чем занимаетесь'],
  ['🎯', 'Задачи', 'Что помощник должен делать'],
  ['✍️', 'Стиль', 'Как с вами общаться'],
  ['🧠', 'Память', 'Что важно запоминать'],
  ['🛠️', 'Инструменты', 'Что можно подключить'],
];

const setupHints = [
  {
    title: 'Что можно написать',
    items: [
      'Как тебя зовут и чем занимаешься',
      'Какие у тебя проекты или работа',
      'Для чего хочешь использовать помощника',
      'Кто твои клиенты или команда',
    ],
    example: 'Например: «Я Дмитрий, занимаюсь проектами и бизнесом. У меня несколько проектов, хочу помощника для работы и личных задач».',
  },
  {
    title: 'Не знаешь, с чего начать? Вот идеи',
    items: [
      'Помогать с рабочими задачами и планами',
      'Писать и редактировать сообщения',
      'Искать информацию и объяснять сложное',
      'Следить за задачами и напоминать',
      'Помогать с проектами, сайтами и идеями',
      'Анализировать документы и файлы',
    ],
    example: 'Например: «Помогай мне планировать день, писать сообщения клиентам, разбирать документы и придумывать идеи для моих проектов».',
  },
  {
    title: 'Как можно настроить стиль',
    items: [
      'Коротко и по делу',
      'Просто и по-человечески',
      'Подробно, если тема сложная',
      'Без канцелярита и лишних слов',
      'Можешь спорить со мной, если я ошибаюсь',
      'Сначала вывод, потом объяснение',
    ],
    example: 'Например: «Отвечай по-человечески и без канцелярита. Коротко, когда вопрос простой, подробно — когда это действительно нужно».',
  },
  {
    title: 'Что агент может запоминать',
    items: [
      'Как меня зовут и как ко мне обращаться',
      'Мои интересы и предпочтения',
      'Мои проекты, цели и планы',
      'Важные даты и события',
      'Какой формат ответов мне нравится',
      'Что мне не нравится и чего избегать',
    ],
    example: 'Например: «Запомни, что я занимаюсь своими проектами. Мне нравятся короткие практичные ответы, а если есть проблема — сразу говори, что делать».',
  },
  {
    title: 'Что можно подключить',
    items: [
      '🌐 Поиск в интернете',
      '⏰ Напоминания и задачи',
      '📄 Работа с документами',
      '🧮 Калькулятор и расчёты',
      '🖼️ Создание изображений',
      '📅 Календарь и встречи',
    ],
    example: 'Например: «Мне нужны поиск в интернете, напоминания, работа с файлами и возможность помогать мне с календарём».',
  },
];

export default function Home() {
  const [tab, setTab] = useState<'overview' | 'agents' | 'setup'>('overview');
  const [agents] = useState(seedAgents);
  const [selected, setSelected] = useState(seedAgents[0]);
  const [setupStep, setSetupStep] = useState(0);
  const [setupText, setSetupText] = useState('');
  const [created, setCreated] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(true);

  const stats = useMemo(() => ({
    users: agents.length,
    active: agents.filter(a => a.status === 'online').length,
    messages: agents.reduce((sum, a) => sum + a.messages, 0),
    memories: agents.reduce((sum, a) => sum + a.memory, 0),
  }), [agents]);

  const startSetup = () => {
    setTab('setup');
    setSetupStep(0);
    setSetupText('');
    setCreated(false);
    setHintsOpen(true);
  };

  const nextSetup = () => {
    if (setupStep < onboarding.length - 1) {
      setSetupStep(s => s + 1);
      setSetupText('');
      setHintsOpen(true);
    } else {
      setCreated(true);
    }
  };

  const useHint = (hint: string) => {
    setSetupText(prev => {
      if (!prev.trim()) return hint;
      if (prev.includes(hint)) return prev;
      return `${prev}${prev.endsWith(' ') ? '' : '\n'}${hint}`;
    });
  };

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">✦</div>
          <div><strong>Universal AI</strong><span>Agent Platform</span></div>
        </div>
        <nav>
          <button className={tab === 'overview' ? 'nav active' : 'nav'} onClick={() => setTab('overview')}>⌂ <span>Обзор</span></button>
          <button className={tab === 'agents' ? 'nav active' : 'nav'} onClick={() => setTab('agents')}>◉ <span>Пользователи</span><b>{stats.users}</b></button>
          <button className={tab === 'setup' ? 'nav active' : 'nav'} onClick={startSetup}>＋ <span>Создать агента</span></button>
          <button className="nav" onClick={() => alert('Раздел инструментов будет подключён в следующем этапе')}>⌘ <span>Инструменты</span></button>
          <button className="nav" onClick={() => alert('Тарифы и лимиты будут подключены в следующем этапе')}>◈ <span>Тарифы</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="owner"><div className="owner-avatar">Д</div><div><strong>Создатель</strong><span>Администратор</span></div><span>•••</span></div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><span className="kicker">ПЛАТФОРМА АГЕНТОВ</span><h1>{tab === 'setup' ? 'Создание персонального агента' : tab === 'agents' ? 'Пользователи' : 'Добро пожаловать в Universal AI'}</h1></div>
          <div className="top-actions"><span className="live"><i /> Система онлайн</span><button className="primary" onClick={startSetup}>+ Новый агент</button></div>
        </header>

        {tab === 'overview' && <>
          <section className="hero-card">
            <div><div className="hero-icon">✦</div><h2>Один бот.<br/><em>Свой агент для каждого.</em></h2><p>Пользователь просто рассказывает, что ему нужно. Агент сам собирает профиль, задачи, стиль общения и память.</p><button className="hero-button" onClick={startSetup}>Попробовать настройку →</button></div>
            <div className="agent-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core">✦</div><span className="chip chip-a">🧠 Память</span><span className="chip chip-b">🎯 Задачи</span><span className="chip chip-c">🛠 Инструменты</span></div>
          </section>
          <section className="stats-grid">
            <Stat label="Пользователей" value={stats.users} hint="демо-данные" />
            <Stat label="Активных агентов" value={stats.active} hint="прямо сейчас" />
            <Stat label="Сообщений" value={stats.messages.toLocaleString('ru-RU')} hint="всего обработано" />
            <Stat label="Записей памяти" value={stats.memories} hint="персональный контекст" />
          </section>
          <section className="two-col">
            <div className="panel"><div className="panel-head"><div><span className="kicker">КАК ЭТО РАБОТАЕТ</span><h3>Пользователь настраивает агента разговором</h3></div></div>{onboarding.map(([icon, title, text], i) => <div className="flow-row" key={title}><div className="flow-number">{i + 1}</div><div className="flow-icon">{icon}</div><div><strong>{title}</strong><p>{text}</p></div><span>→</span></div>)}</div>
            <div className="panel"><div className="panel-head"><div><span className="kicker">ПОСЛЕДНИЕ АГЕНТЫ</span><h3>Живые пользователи</h3></div><button className="text-btn" onClick={() => setTab('agents')}>Все →</button></div>{agents.map(agent => <AgentRow key={agent.id} agent={agent} onClick={() => { setSelected(agent); setTab('agents'); }} />)}</div>
          </section>
        </>}

        {tab === 'agents' && <section className="agents-layout"><div className="panel agents-list"><div className="panel-head"><div><span className="kicker">MULTI-TENANT</span><h3>Все персональные агенты</h3></div><span className="count-pill">{agents.length}</span></div>{agents.map(agent => <AgentRow key={agent.id} agent={agent} selected={selected.id === agent.id} onClick={() => setSelected(agent)} />)}</div><div className="panel agent-detail"><div className="detail-avatar">{selected.name.slice(0, 1)}</div><span className="status-badge"><i /> {selected.status === 'online' ? 'Активен' : 'Настройка'}</span><h2>{selected.name}</h2><p>{selected.role}</p><div className="detail-grid"><MiniStat label="Задач" value={selected.tasks} /><MiniStat label="Сообщений" value={selected.messages.toLocaleString('ru-RU')} /><MiniStat label="Память" value={selected.memory} /></div><div className="memory-preview"><div><strong>🧠 Персональная память</strong><span>{selected.memory} записей</span></div><p>Профиль, предпочтения, прошлые задачи и важный контекст хранятся отдельно для этого пользователя.</p></div><button className="primary wide" onClick={startSetup}>Создать похожего агента</button></div></section>}

        {tab === 'setup' && <section className="setup-layout"><div className="panel setup-main">{created ? <div className="success"><div className="success-icon">✓</div><span className="kicker">АГЕНТ ГОТОВ</span><h2>Персональный агент создан</h2><p>В реальном продукте здесь будет создан профиль пользователя, память, набор задач и доступные инструменты. Следующий шаг — подключить Telegram.</p><button className="primary" onClick={() => setTab('overview')}>Вернуться в обзор</button></div> : <><div className="progress"><span>Шаг {setupStep + 1} из {onboarding.length}</span><div><i style={{ width: `${((setupStep + 1) / onboarding.length) * 100}%` }} /></div></div><div className="setup-icon">{onboarding[setupStep][0]}</div><span className="kicker">{onboarding[setupStep][1]}</span><h2>{setupStep === 0 ? 'Давайте познакомимся' : setupStep === 1 ? 'Какие задачи нужны?' : setupStep === 2 ? 'Как с вами общаться?' : setupStep === 3 ? 'Что важно помнить?' : 'Какие возможности подключить?'}</h2><p className="setup-description">{setupStep === 0 ? 'Имя, профессия и немного контекста — остальное агент выяснит сам.' : setupStep === 1 ? 'Опишите задачи своими словами. Не нужно выбирать из списка.' : setupStep === 2 ? 'Выберите удобный стиль — можно отметить несколько вариантов.' : setupStep === 3 ? 'Укажите информацию, которую агенту стоит сохранять между разговорами.' : 'Можно выбрать нужные возможности сейчас, а остальные подключить позже.'}</p>

          <div className="hint-box">
            <button className="hint-header" onClick={() => setHintsOpen(v => !v)}><span>💡 {setupHints[setupStep].title}</span><b>{hintsOpen ? '⌃' : '⌄'}</b></button>
            {hintsOpen && <div className="hint-content"><div className="hint-chips">{setupHints[setupStep].items.map(hint => <button key={hint} className="hint-chip" onClick={() => useHint(hint)}>{hint}<span>+</span></button>)}</div><div className="hint-example"><span>Пример</span><p>{setupHints[setupStep].example}</p><button onClick={() => useHint(setupHints[setupStep].example)}>Использовать пример</button></div></div>}
          </div>

          <div className="textarea-wrap"><textarea value={setupText} onChange={e => setSetupText(e.target.value)} placeholder={setupHints[setupStep].example} maxLength={2000} /><span className="counter">{setupText.length}/2000</span></div><div className="setup-actions"><button className="ghost" onClick={() => setTab('overview')}>{setupStep === 0 ? 'Отмена' : 'Пропустить'}</button><button className="primary" onClick={nextSetup}>{setupStep === onboarding.length - 1 ? 'Создать агента ✦' : 'Продолжить →'}</button></div></>}</div><div className="panel setup-side"><span className="kicker">ПРИНЦИП</span><h3>Не анкета.<br/>Разговор.</h3><p>Пользователю не нужно придумывать правильные промпты. Мы показываем понятные примеры, а агент сам превращает обычные слова в настройки.</p><div className="quote">«Мне нужен помощник, который будет помогать мне с магазином и отвечать клиентам»<small>— обычный запрос пользователя</small></div></div></section>}
      </section>
    </main>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) { return <div className="stat"><span>{label}</span><strong>{value}</strong><small>{hint}</small></div> }
function MiniStat({ label, value }: { label: string; value: string | number }) { return <div><span>{label}</span><strong>{value}</strong></div> }
function AgentRow({ agent, selected, onClick }: { agent: Agent; selected?: boolean; onClick: () => void }) { return <button className={`agent-row ${selected ? 'selected' : ''}`} onClick={onClick}><div className="agent-avatar">{agent.name.slice(0, 1)}</div><div className="agent-copy"><strong>{agent.name}</strong><span>{agent.role}</span></div><div className="agent-meta"><span className={agent.status}>{agent.status === 'online' ? 'Онлайн' : 'Настройка'}</span><small>{agent.messages} сообщений</small></div></button> }
