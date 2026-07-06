import Link from 'next/link';

export default function BackButton() {
  return (
    <Link className="neon-button-outline back-button" href="/dashboard" aria-label="Вернуться в дашборд">
      ← Назад
    </Link>
  );
}
