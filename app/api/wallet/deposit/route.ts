import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { amount } = await request.json();
  const value = Number(amount);
  if (!Number.isInteger(value) || value <= 0) return NextResponse.json({ error: 'Некорректная сумма.' }, { status: 400 });

  const tx = await prisma.transaction.create({ data: { userId: user.id, type: 'deposit', amount: value, status: 'pending', reason: 'Пополнение Stripe Checkout' } });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ checkoutUrl: null, transaction: tx, message: 'STRIPE_SECRET_KEY не настроен. Транзакция создана в pending.' });

  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price_data: { currency: 'rub', product_data: { name: 'Пополнение баланса Нерв' }, unit_amount: value * 100 }, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?cancel=1`,
    metadata: { transactionId: String(tx.id), userId: String(user.id) },
  });
  await prisma.transaction.update({ where: { id: tx.id }, data: { stripePaymentIntentId: session.id } });
  return NextResponse.json({ checkoutUrl: session.url, transactionId: tx.id });
}
