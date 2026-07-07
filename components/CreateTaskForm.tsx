'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function CreateTaskForm() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setUploadProgress(0);

    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const reward = Number(formData.get('reward'));

    try {
      // 1. Проверка видео
      if (!videoFile) {
        setError('Пожалуйста, загрузите видео.');
        setLoading(false);
        return;
      }

      // 2. Получение Upload URL от Mux
      const uploadResponse = await fetch('/api/video/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        setError(errorData?.error || 'Не удалось получить ссылку для загрузки');
        setLoading(false);
        return;
      }

      const { url: uploadUrl, uploadId } = await uploadResponse.json();

      // 3. Загрузка видео на Mux
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) resolve(null);
          else reject(new Error(`Upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(videoFile);
      });

      // 4. Создание задания
      const createResponse = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          reward,
          videoUploadId: uploadId,
        }),
      });

      const data = await createResponse.json();

      if (!createResponse.ok) {
        setError(data?.error || 'Не удалось создать задание.');
        setLoading(false);
        return;
      }

      event.currentTarget.reset();
      setVideoFile(null);
      setVideoPreview(null);
      setUploadProgress(0);
      setMessage('✅ Задание создано! Видео загружено и доступно игрокам.');
      router.refresh();

      // Перенаправление через 2 секунды
      setTimeout(() => router.push('/dashboard'), 2000);
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
      // Проверка размера (макс 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Видео не должно превышать 100 MB');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Название
        <input
          name="title"
          placeholder="Пробежать 1 км"
          required
          className="neon-input"
        />
      </label>

      <label>
        Описание
        <textarea
          name="description"
          placeholder="Опиши условия задания"
          className="neon-input"
          rows={3}
        />
      </label>

      <label>
        Награда (₽)
        <input
          name="reward"
          type="number"
          min="1"
          step="1"
          defaultValue="100"
          required
          className="neon-input"
        />
      </label>

      <label>
        Видео (MP4, до 100MB)
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleVideoChange}
          required
          className="neon-input"
        />
      </label>

      {videoPreview && (
        <div style={{ marginTop: 8 }}>
          <video
            src={videoPreview}
            controls
            style={{ width: '100%', maxHeight: 300, borderRadius: 8 }}
          />
          <p className="muted" style={{ fontSize: 12 }}>
            {videoFile?.name} ({(videoFile?.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div style={{ marginTop: 8 }}>
          <p className="muted">Загрузка видео: {uploadProgress}%</p>
          <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)',
                borderRadius: 4,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <button
        className="neon-button"
        disabled={loading}
        type="submit"
        style={{ width: '100%' }}
      >
        {loading ? 'Создаём...' : 'Создать задание'}
      </button>
    </form>
  );
}
