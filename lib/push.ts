import webpush from 'web-push';
import { prisma } from './prisma';

function configureWebPush() {
  const subject = process.env.WEB_PUSH_SUBJECT || 'mailto:admin@nerv.local';
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function sendPushToUser(userId: number, payload: { title: string; body: string; url?: string }) {
  if (!configureWebPush()) return { skipped: true, reason: 'VAPID keys are not configured' };
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  const body = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        body
      )
    )
  );
  return { sent: results.filter((r) => r.status === 'fulfilled').length, total: subscriptions.length };
}

export async function sendPushToRole(role: string, payload: { title: string; body: string; url?: string }) {
  const users = await prisma.user.findMany({ where: { role, isBanned: false }, select: { id: true } });
  await Promise.all(users.map((user) => sendPushToUser(user.id, payload)));
  return { users: users.length };
}
