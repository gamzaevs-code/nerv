'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TakeTaskButton({ taskId }: { taskId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function takeTask() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/tasks/${taskId}/take`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Не удалось взять задание.');
        return;
      }
      // ✅ Перенаправляем на страницу задания
      router.push(`/task/${taskId}`);
    } catch {
      setError('Ошибка сети.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form">
      <button className="neon-button" type="button" onClick={takeTask} disabled={loading} style={{ width: '100%' }}>
        {loading ? '🎯 Берём...' : '🎯 Взять задание'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}