'use client';

import { useEffect, useMemo, useState } from 'react';

type Agent = { id: string; name: string; role: string; status: 'online' | 'setup'; tasks: number; messages: number; memory: number };

const seedAgents: Agent[] = [
  { id: 'demo-1', name: 'Дмитрий', role: 'Универсальный помощник', status: 'online', tasks: 8, messages: 1842, memory: 126 },
  { id: 'demo-2', name: 'Анна', role: 'Помощник по родительскому комитету', status: 'online', tasks: 5, messages: 321, memory: 42 },
  { id: 'demo-3', name: 'Иван', role: 'Бизнес-помощник', status: 'setup', tasks: 3, messages: 94, memory: 18 },
];

const onboarding = [
  { icon: '👋', title: 'Знакомство', heading: 'Давайте познакомимся', description: 'Имя, профессия и немного контекста — остальное агент выяснит сам.', prompt: 'Расскажи немного о себе', placeholder: 'Например: Я Дмитрий, занимаюсь проектами и бизнесом. У меня несколько проектов, хочу помощника для работы и личных задач.', hints: ['Как тебя зовут и чем занимаешься', 'Какие у тебя проекты или работа', 'Для чего хочешь использовать помощника', 'Кто твои клиенты или команда'] },
  { icon: '🎯', title: 'Задачи', heading: 'Какие задачи нужны?', description: 'Не нужно выбирать правильную формулировку. Просто расскажи, чем должен помогать агент.', prompt: 'Что ты хочешь поручать помощнику?', placeholder: 'Например: Помогай мне планировать день, писать сообщения клиентам, разбирать документы и придумывать идеи.', hints: ['Писать и редактировать тексты', 'Отвечать клиентам', 'Планировать день и задачи', 'Искать информацию', 'Помогать с проектами', 'Анализировать документы'] },
  { icon: '✍️', title: 'Стиль', heading: 'Как с вами общаться?', description: 'Выбери несколько вариантов или опиши стиль своими словами.', prompt: 'Какие ответы тебе нравятся?', placeholder: 'Например: Отвечай по-человечески и без канцелярита. Коротко, когда вопрос простой, подробно — когда это действительно нужно.', hints: ['Коротко и по делу', 'Просто и по-человечески', 'Подробно, если тема сложная', 'Без лишней воды', 'Дружелюбно и с юмором', 'Сначала вывод, потом объяснение'] },
  { icon: '🧠', title: 'Память', heading: 'Что важно помнить?', description: 'Укажи информацию, которую агенту стоит сохранять между разговорами.', prompt: 'Что помощнику важно запоминать?', placeholder: 'Например: Запоминай мои цели, проекты, предпочтения, важные даты и формат ответов, который мне нравится.', hints: ['Как меня зовут и как обращаться', 'Мои интересы и предпочтения', 'Мои проекты, цели и планы', 'Важные даты и события', 'Мои рабочие правила', 'Что мне не нравится'] },
  { icon: '🛠️', title: 'Инструменты', heading: 'Какие возможности подключить?', description: 'Можно выбрать нужные возможности сейчас, остальные подключить позже.', prompt: 'Что агент должен уметь?', placeholder: 'Например: Мне нужны поиск в интернете, напоминания, работа с файлами и календарём.', hints: ['🌐 Поиск в интернете', '⏰ Напоминания и задачи', '📄 Работа с документами', '🧮 Калькулятор и расчёты', '🖼️ Создание изображений', '📅 Календарь и встречи'] },
];

const storageKey = 'universal-ai-onboarding-draft';

export default function Home() {
  const [tab, setTab] = useState<'overview' | 'agents' | 'setup'>('overview');
  const [agents] = useState(seedAgents);
  const [selected, setSelected] = useState(seedAgents[0]);
  const [setupStep, setSetupStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
  const [created, setCreated] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { const saved = localStorage.getItem(storageKey); if (saved) setAnswers(JSON.parse(saved)); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(answers)); } catch {}
  }, [answers]);

  const stats = useMemo(() => ({ users: agents.length, active: agents.filter(a => a.status === 'online').length, messages: agents.reduce((s, a) => s + a.messages, 0), memories: agents.reduce((s, a) => s + a.memory, 0) }), [agents]);
  const current = onboarding[setupStep];
  const profileName = answers[0].split(/[,.\n]/)[0].replace(/^.*?(?:я\s+)/i, '').trim() || 'Новый пользователь';
  const generatedRole = answers[1] ? (answers[1].toLowerCase().includes('клиент') ? 'Персональный помощник по работе с клиентами' : 'Персональный ИИ-помощник') : 'Персональный ИИ-помощник';
  const systemProfile = `Ты персональный ИИ-помощник пользователя ${profileName}. Задачи: ${answers[1] || 'уточнять задачи пользователя и помогать с ними'}. Стиль: ${answers[2] || 'простой, понятный и полезный'}. Память: ${answers[3] || 'сохраняй только важный контекст по запросу пользователя'}. Инструменты: ${answers[4] || 'используй доступные инструменты по необходимости'}.`;

  const startSetup = () => { setTab('setup'); setSetupStep(0); setCreated(false); setHintsOpen(true); setCopied(false); };
  const setAnswer = (value: string) => setAnswers(prev => prev.map((x, i) => i === setupStep ? value : x));
  const useHint = (hint: string) => setAnswer(answers[setupStep] ? `${answers[setupStep]}${answers[setupStep].endsWith(' ') ? '' : '\n'}${hint}` : hint);
  const nextSetup = () => { if (setupStep < onboarding.length - 1) { setSetupStep(s => s + 1); setHintsOpen(true); } else setCreated(true); };
  const resetDraft = () => { setAnswers(['', '', '', '', '']); setSetupStep(0); setCreated(false); setCopied(false); };
  const copyProfile = async () => { try { await navigator.clipboard.writeText(systemProfile); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} };

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">✦</div><div><strong>Universal AI</strong><span>Agent Platform</span></div></div>
      <nav>
        <button className={tab === 'overview' ? 'nav active' : 'nav'} onClick={() => setTab('overview')}>⌂ <span>Обзор</span></button>
        <button className={tab === 'agents' ? 'nav active' : 'nav'} onClick={() => setTab('agents')}>◉ <span>Пользователи</span><b>{stats.users}</b></button>
        <button className={tab === 'setup' ? 'nav active' : 'nav'} onClick={startSetup}>＋ <span>Создать агента</span></button>
        <button className="nav" onClick={() => setTab('setup')}>⌘ <span>Инструменты</span></button>
        <button className="nav" onClick={() => alert('Тарифы подключим после запуска базового агента')}>◈ <span>Тарифы</span></button>
      </nav>
      <div className="sidebar-bottom"><div className="owner"><div className="owner-avatar">Д</div><div><strong>Создатель</strong><span>Администратор</span></div><span>•••</span></div></div>
    </aside>

    <section className="content">
      <header className="topbar"><div><span className="kicker">ПЛАТФОРМА АГЕНТОВ</span><h1>{tab === 'setup' ? 'Создание персонального агента' : tab === 'agents' ? 'Пользователи' : 'Добро пожаловать в Universal AI'}</h1></div><div className="top-actions"><span className="live"><i /> Система онлайн</span><button className="primary" onClick={startSetup}>+ Новый агент</button></div></header>

      {tab === 'overview' && <>
        <section className="hero-card"><div><div className="hero-icon">✦</div><h2>Один бот.<br/><em>Свой агент для каждого.</em></h2><p>Пользователь просто рассказывает, что ему нужно. Агент сам собирает профиль, задачи, стиль общения и память.</p><button className="hero-button" onClick={startSetup}>Попробовать настройку →</button></div><div className="agent-orbit"><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="orbit-core">✦</div><span className="chip chip-a">🧠 Память</span><span className="chip chip-b">🎯 Задачи</span><span className="chip chip-c">🛠 Инструменты</span></div></section>
        <section className="stats-grid"><Stat label="Пользователей" value={stats.users} hint="демо-данные"/><Stat label="Активных агентов" value={stats.active} hint="прямо сейчас"/><Stat label="Сообщений" value={stats.messages.toLocaleString('ru-RU')} hint="всего обработано"/><Stat label="Записей памяти" value={stats.memories} hint="персональный контекст"/></section>
        <section className="two-col"><div className="panel"><div className="panel-head"><div><span className="kicker">КАК ЭТО РАБОТАЕТ</span><h3>Настройка разговором</h3></div></div>{onboarding.map((s,i)=><div className="flow-row" key={s.title}><div className="flow-number">{i+1}</div><div className="flow-icon">{s.icon}</div><div><strong>{s.title}</strong><p>{s.description}</p></div><span>→</span></div>)}</div><div className="panel"><div className="panel-head"><div><span className="kicker">ПОСЛЕДНИЕ АГЕНТЫ</span><h3>Живые пользователи</h3></div><button className="text-btn" onClick={() => setTab('agents')}>Все →</button></div>{agents.map(agent=><AgentRow key={agent.id} agent={agent} onClick={() => {setSelected(agent);setTab('agents')}}/>)}</div></section>
      </>}

      {tab === 'agents' && <section className="agents-layout"><div className="panel agents-list"><div className="panel-head"><div><span className="kicker">MULTI-TENANT</span><h3>Все персональные агенты</h3></div><span className="count-pill">{agents.length}</span></div>{agents.map(agent=><AgentRow key={agent.id} agent={agent} selected={selected.id===agent.id} onClick={()=>setSelected(agent)}/>)}</div><div className="panel agent-detail"><div className="detail-avatar">{selected.name.slice(0,1)}</div><span className="status-badge"><i/> {selected.status==='online'?'Активен':'Настройка'}</span><h2>{selected.name}</h2><p>{selected.role}</p><div className="detail-grid"><MiniStat label="Задач" value={selected.tasks}/><MiniStat label="Сообщений" value={selected.messages.toLocaleString('ru-RU')}/><MiniStat label="Память" value={selected.memory}/></div><div className="memory-preview"><div><strong>🧠 Персональная память</strong><span>{selected.memory} записей</span></div><p>Профиль, предпочтения и важный контекст хранятся отдельно для каждого пользователя.</p></div><button className="primary wide" onClick={startSetup}>Создать похожего агента</button></div></section>}

      {tab === 'setup' && <section className="setup-layout"><div className="panel setup-main">{created ? <div className="success"><div className="success-icon">✓</div><span className="kicker">АГЕНТ ГОТОВ</span><h2>{profileName}, профиль собран</h2><p>Мы превратили ответы пользователя в основу персонального агента. Сейчас это локальный демо-профиль; следующий слой подключит его к Telegram и базе данных.</p><div className="generated-agent"><div className="generated-avatar">{profileName.slice(0,1).toUpperCase()}</div><div><span>ПЕРСОНАЛЬНЫЙ АГЕНТ</span><strong>{generatedRole}</strong><small>Статус: готов к подключению</small></div></div><div className="summary-card">{onboarding.map((s,i)=><div key={s.title}><span>{s.icon}</span><div><strong>{s.title}</strong><p>{answers[i] || 'Не указано'}</p></div></div>)}</div><div className="system-profile"><div><strong>⚙️ Сформированный профиль агента</strong><button onClick={copyProfile}>{copied ? '✓ Скопировано' : 'Копировать'}</button></div><p>{systemProfile}</p></div><div className="setup-actions"><button className="ghost" onClick={resetDraft}>Настроить заново</button><button className="primary" onClick={()=>setTab('overview')}>Вернуться в обзор</button></div></div> : <><div className="progress"><span>Шаг {setupStep+1} из {onboarding.length}</span><div><i style={{width:`${((setupStep+1)/onboarding.length)*100}%`}}/></div></div><div className="setup-icon">{current.icon}</div><span className="kicker">{current.title}</span><h2>{current.heading}</h2><p className="setup-description">{current.description}</p><div className="hint-box"><button className="hint-header" onClick={()=>setHintsOpen(v=>!v)}><span>💡 {current.prompt}</span><b>{hintsOpen?'⌃':'⌄'}</b></button>{hintsOpen&&<div className="hint-content"><p className="hint-label">Нажми на подходящий вариант — он добавится в поле ниже:</p><div className="hint-chips">{current.hints.map(h=><button key={h} className="hint-chip" onClick={()=>useHint(h)}>{h}<span>+</span></button>)}</div><div className="hint-example"><span>ГОТОВЫЙ ПРИМЕР</span><p>{current.placeholder}</p><button onClick={()=>setAnswer(current.placeholder.replace(/^Например:\s*/,''))}>Использовать пример</button></div></div>}</div><div className="textarea-wrap"><textarea value={answers[setupStep]} onChange={e=>setAnswer(e.target.value)} placeholder={current.placeholder} maxLength={2000}/><span className="counter">{answers[setupStep].length}/2000</span></div><div className="setup-actions"><button className="ghost" onClick={()=>setupStep===0?setTab('overview'):setSetupStep(s=>s-1)}>{setupStep===0?'Отмена':'← Назад'}</button><span className="save-note">✓ Черновик сохраняется автоматически</span><button className="primary" onClick={nextSetup}>{setupStep===onboarding.length-1?'Создать агента ✦':'Продолжить →'}</button></div></>}</div><div className="panel setup-side"><span className="kicker">ПРИНЦИП</span><h3>Не анкета.<br/>Разговор.</h3><p>Пользователю не нужно знать, как писать промпты. Мы показываем понятные варианты и превращаем обычные слова в настройки агента.</p><div className="quote">«Мне нужен помощник, который будет помогать мне с магазином и отвечать клиентам»<small>— обычный запрос пользователя</small></div><div className="side-tip">💡 <strong>Можно писать как угодно</strong><span>Агент потом сам структурирует ответ.</span></div></div></section>}
    </section>
  </main>;
}

function Stat({label,value,hint}:{label:string;value:string|number;hint:string}){return <div className="stat"><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>}
function MiniStat({label,value}:{label:string;value:string|number}){return <div><span>{label}</span><strong>{value}</strong></div>}
function AgentRow({agent,selected,onClick}:{agent:Agent;selected?:boolean;onClick:()=>void}){return <button className={`agent-row ${selected?'selected':''}`} onClick={onClick}><div className="agent-avatar">{agent.name.slice(0,1)}</div><div className="agent-copy"><strong>{agent.name}</strong><span>{agent.role}</span></div><div className="agent-meta"><span className={agent.status}>{agent.status==='online'?'Онлайн':'Настройка'}</span><small>{agent.messages} сообщений</small></div></button>}
