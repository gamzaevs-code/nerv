'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';

export default function CreateTaskForm() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Запись видео
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        setIsRecording(false);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      // ✅ ЗАГЛУШКА: если камера не доступна
      setError('Камера не доступна. Используйте загрузку файла.');
      // ✅ Создаём демо-видео
      const dummyVideo = new File(['dummy'], 'demo-video.mp4', { type: 'video/mp4' });
      setVideoFile(dummyVideo);
      setVideoPreview('/uploads/dummy.mp4');
      setMessage('ℹ️ Используется демо-видео (заглушка)');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const reward = Number(formData.get('reward'));

    try {
      // ✅ Если видео не загружено — используем заглушку
      let videoUrl = null;
      if (videoFile) {
        // Имитация загрузки видео
        await new Promise((resolve) => setTimeout(resolve, 500));
        videoUrl = '/uploads/demo-video.mp4';
      }

      const createRes = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          reward,
          videoUrl,
        }),
      });

      const data = await createRes.json();

      if (!createRes.ok) {
        setError(data.error || 'Не удалось создать задание');
        setLoading(false);
        return;
      }

      setMessage('✅ Задание создано!');
      event.currentTarget.reset();
      setVideoFile(null);
      setVideoPreview(null);
      router.push('/dashboard');
    } catch (err) {
      console.error('Create task error:', err);
      setError('Не удалось создать задание. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Название
        <input name="title" placeholder="Пробежать 1 км" required className="neon-input" />
      </label>

      <label>
        Описание
        <textarea name="description" placeholder="Опиши условия задания" className="neon-input" rows={3} />
      </label>

      <label>
        Награда (₽)
        <input name="reward" type="number" min="1" defaultValue="100" required className="neon-input" />
      </label>

      <label style={{ marginTop: 8 }}>
        <span style={{ display: 'block', marginBottom: 8 }}>📹 Видео (опционально)</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={isRecording ? 'neon-button' : 'neon-button-outline'}
            onClick={isRecording ? stopRecording : startRecording}
            style={{ flex: 1 }}
          >
            {isRecording ? '⏹️ Остановить запись' : '🎥 Записать с камеры'}
          </button>
          <label className="neon-button-outline" style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
            📁 Загрузить файл
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </label>

      {isRecording && (
        <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444' }}>
          <p style={{ color: '#EF4444', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1s infinite' }} />
            🔴 Идёт запись...
          </p>
        </div>
      )}

      {videoPreview && (
        <div style={{ marginTop: 8 }}>
          <video src={videoPreview} controls style={{ width: '100%', maxHeight: 300, borderRadius: 8 }} />
          <p className="muted" style={{ fontSize: 12 }}>
            {videoFile?.name} ({(videoFile?.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <button className="neon-button" disabled={loading} type="submit" style={{ width: '100%' }}>
        {loading ? 'Создаём...' : '🚀 Создать задание'}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </form>
  );
}