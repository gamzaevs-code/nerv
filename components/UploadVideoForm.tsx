'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UploadVideoForm({ taskId }: { taskId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // ✅ Отправляем JSON без файла
      const response = await fetch(`/api/tasks/${taskId}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: 'dummy-upload-id' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || 'Не удалось загрузить видео.');
        return;
      }

      setMessage('✅ Видео загружено! Задание отправлено на голосование.');
      setPreview(null);
      setRecordedFile(null);
      router.refresh();
    } catch {
      setError('Ошибка сети.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <button className="neon-button" type="submit" disabled={loading}>
        {loading ? 'Загрузка...' : '📤 Загрузить видео'}
      </button>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
    </form>
  );
}