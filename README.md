# Нерв

Неоновое игровое веб-приложение на **Next.js 14**, **Prisma** и **SQLite**.

## Возможности

- Регистрация и вход: `viewer`, `player`, `admin`
- Игровые задания, голосование, прогнозы, награды
- Уровни, опыт, достижения
- Рефералы, MLM-начисления, инвайт-коды
- GDPR export в ZIP
- Жалобы и админ-модерация
- Stripe Checkout skeleton для пополнений и заявки на вывод
- PWA: manifest + service worker
- Admin analytics на Recharts
- Запись видео через MediaRecorder, превью, лимит 60 секунд
- Support widget с polling API
- Турниры, daily quests, видео-челленджи
- Telegram linking skeleton
- i18n resources RU/EN + переключатель языка
- Тёмная/светлая тема
- Backup API, Dockerfile, GitHub Actions

## Локальный запуск

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Откройте `http://localhost:3000`.

## Production build

```bash
NODE_ENV=production npm run build
npm run start
```

## Env-переменные

```env
JWT_SECRET="your-production-secret"
DATABASE_URL="postgresql://neondb_owner:YOUR_NEON_PASSWORD@ep-your-endpoint.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
STRIPE_SECRET_KEY="sk_live_or_test"
TELEGRAM_BOT_TOKEN="telegram-bot-token"
VIDEO_PROVIDER="cloudflare-stream-or-mux"
```

## Страницы

- `/dashboard`, `/tasks`, `/task/:id`, `/create`, `/my-tasks`, `/voting`
- `/leaderboard`, `/achievements`, `/daily-quests`, `/tournaments`, `/challenges`
- `/messages`, `/profile`, `/profile/edit`, `/profile/export`
- `/referrals`, `/referrals/tree`, `/wallet`, `/notifications`
- `/settings/telegram`
- `/admin`, `/admin/dashboard`, `/admin/reports`, `/admin/invites`, `/admin/tournaments`, `/admin/translations`, `/admin/backup`, `/admin/support`

## Деплой на Vercel

Проект подготовлен файлом `vercel.json` и скриптом `vercel-build`.

1. Загрузите проект в GitHub/GitLab.
2. Создайте проект в Vercel.
3. Укажите env-переменные из секции выше.
4. Build command: `npm run vercel-build`.
5. После деплоя примените миграции:

```bash
npx prisma migrate deploy
```

> Важно: SQLite и `public/uploads` не подходят для production serverless-хранилища. Для production используйте PostgreSQL/Turso и S3/R2/Vercel Blob/Cloudflare Stream/Mux.

## Docker

```bash
docker build -t nerv .
docker run -p 3000:3000 --env-file .env nerv
```

## Ограничения внешних интеграций

- Stripe требует реальный аккаунт, ключи и webhook для подтверждения payment intent.
- Stripe Connect/выводы реализованы как pending-заявки; production-payout требует KYC и Connect onboarding.
- Telegram требует bot token и chat id.
- Cloudflare Stream/Mux добавлены как точка интеграции `/api/video/upload-url`; локально видео остаётся в `public/uploads`.
- Lighthouse 90+ требует запуска в браузерном окружении и финальной настройки CDN/изображений/видео.
