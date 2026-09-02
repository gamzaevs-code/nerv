'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';

export default function UploadVideoForm({ taskId }: { taskId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function validateDuration(file: File) {
    const url = URL.createObjectURL(file);
    const ok = await new Promise<boolean>((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => { resolve(video.duration <= 60); URL.revokeObjectURL(url); };
      video.onerror = () => { resolve(true); URL.revokeObjectURL(url); };
      video.src = url;
    });
    return ok;
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
        setRecordedFile(file);
        setPreview(URL.createObjectURL(file));
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); setRecording(false); }, 60_000);
    } catch { setError('Камера недоступна. Выберите файл.'); }
  }

  function stopRecording() { recorderRef.current?.stop(); setRecording(false); }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fileInput = (e.currentTarget.elements.namedItem('video') as HTMLInputElement);
    const chosen = recordedFile || fileInput?.files?.[0];
    if (!chosen) { setError('Выберите видео или запишите с камеры.'); return; }

    setLoading(true); setError('');
    if (!(await validateDuration(chosen))) { setError('Видео должно быть не длиннее 60 секунд.'); setLoading(false); return; }

    const formData = new FormData();
    formData.set('video', chosen, chosen.name);

    try {
      const response = await fetch(`/api/tasks/${taskId}/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) { setError(data?.error || 'Не удалось загрузить видео.'); return; }
      setMessage('✅ Видео загружено! Задание отправлено на голосование.');
      setPreview(null); setRecordedFile(null);
      router.refresh();
    } catch { setError('Ошибка сети.'); } finally { setLoading(false); }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Видео
        <input name="video" type="file" accept="video/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} />
      </label>
      <div className="nav-links">
        <button className="neon-button-outline" type="button" onClick={recording ? stopRecording : startRecording}>
          {recording ? '⏹ Остановить запись' : '🎥 Записать с камеры'}
        </button>
      </div>
      {preview && <video src={preview} controls style={{ width: '100%', borderRadius: 12, margin: '4px 0' }} />}
      <button className="neon-button" type="submit" disabled={loading}>
        {loading ? 'Загрузка...' : '📤 Загрузить видео'}
      </button>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
    </form>
  );
}