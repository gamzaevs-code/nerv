'use client';

import { useState } from 'react';
import ActivityChart from './ActivityChart';

type Task = { id: number; title: string; status: string; reward: number };
type Vote = { id: number; value: string; task: { title: string } };

type Props = {
  stats: { earned: number; completed: number; reputation: number };
  tasks: Task[];
  votes: Vote[];
  chart: { day: string; actions: number }[];
};

export default function DashboardTabs({ stats, tasks, votes, chart }: Props) {
  const [tab, setTab] = useState<'overview' | 'tasks' | 'votes'>('overview');
  return <section className="glass-card stack" style={{ marginTop: 18 }}>
    <div className="nav-links">
      <button className={tab === 'overview' ? 'neon-button' : 'neon-button-outline'} onClick={() => setTab('overview')}>Обзор</button>
      <button className={tab === 'tasks' ? 'neon-button' : 'neon-button-outline'} onClick={() => setTab('tasks')}>Мои задания</button>
      <button className={tab === 'votes' ? 'neon-button' : 'neon-button-outline'} onClick={() => setTab('votes')}>Мои голосования</button>
    </div>
    {tab === 'overview' && <div className="stack"><div className="grid"><article className="glass-card"><p>Общий заработок</p><div className="balance">{stats.earned} ₽</div></article><article className="glass-card"><p>Выполнено</p><div className="metric">{stats.completed}</div></article><article className="glass-card"><p>Репутация</p><div className="metric">{stats.reputation}</div></article></div><ActivityChart data={chart} /></div>}
    {tab === 'tasks' && <div className="stack">{tasks.map(t => <article className="glass-card" key={t.id}><b>{t.title}</b><p>{t.status} · {t.reward} ₽</p></article>)}</div>}
    {tab === 'votes' && <div className="stack">{votes.map(v => <article className="glass-card" key={v.id}><b>{v.task.title}</b><p>{v.value}</p></article>)}</div>}
  </section>;
}
