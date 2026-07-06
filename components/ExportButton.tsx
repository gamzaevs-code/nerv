'use client';

export default function ExportButton() {
  async function exportData() {
    const response = await fetch('/api/export/request', { method: 'POST' });
    if (!response.ok) return alert('Не удалось экспортировать данные');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nerv-export.zip';
    a.click();
    URL.revokeObjectURL(url);
  }
  return <button className="neon-button" onClick={exportData}>Экспортировать данные</button>;
}
