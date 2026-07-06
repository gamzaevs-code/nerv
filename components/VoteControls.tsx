'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VoteControls({ taskId, votingEndsAt, hasVoted = false }: { taskId: number; votingEndsAt?: string | null; hasVoted?: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState(hasVoted ? 'Вы уже проголосовали.' : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [autoSettled, setAutoSettled] = useState(false);
  const [voted, setVoted] = useState(hasVoted);

  async function vote(value: 'approve' | 'reject') {
    if (voted) return;
    setLoading(value);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/tasks/${taskId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Не удалось проголосовать.');
        if (response.status === 409) setVoted(true);
        return;
      }
      setVoted(true);
      setMessage(value === 'approve' ? 'Голос: зачёт' : 'Голос: не зачёт');
      router.refresh();
    } catch {
      setError('Ошибка сети.');
    } finally {
      setLoading(null);
    }
  }

  async function settle(isAuto = false) {
    setLoading('settle');
    setError('');
    if (!isAuto) setMessage('');

    try {
      const response = await fetch(`/api/tasks/${taskId}/settle`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        if (!isAuto) setError(data?.error || 'Не удалось завершить голосование.');
        return;
      }
      setMessage(data.approved ? 'Задание зачтено. Награда ушла игроку.' : 'Задание отклонено. Награда возвращена зрителю.');
      router.refresh();
    } catch {
      if (!isAuto) setError('Ошибка сети.');
    } finally {
      setLoading(null);
    }
  }

  useEffect(() => {
    if (!votingEndsAt || autoSettled) return;
    const delay = Math.max(0, new Date(votingEndsAt).getTime() - Date.now());
    const timer = window.setTimeout(() => {
      setAutoSettled(true);
      settle(true);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [votingEndsAt, autoSettled]);

  return (
    <div className="form">
      <div className="nav-links">
        <button className="neon-button" type="button" onClick={() => vote('approve')} disabled={!!loading || voted}>
          {loading === 'approve' ? '...' : 'Зачёт'}
        </button>
        <button className="neon-button-outline" type="button" onClick={() => vote('reject')} disabled={!!loading || voted}>
          {loading === 'reject' ? '...' : 'Не зачёт'}
        </button>
        <button className="neon-button-outline" type="button" onClick={() => settle(false)} disabled={!!loading}>
          {loading === 'settle' ? '...' : 'Завершить'}
        </button>
      </div>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
