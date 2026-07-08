import nodemailer from 'nodemailer';

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function getResendFrom(): string {
  return process.env.RESEND_FROM || 'onboarding@resend.dev';
}

function getFromAddress(): string {
  return process.env.RESEND_FROM || process.env.SMTP_FROM || 'onboarding@resend.dev';
}

async function sendWithResend(input: SendEmailInput) {
  const from = getResendFrom();

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error(`Resend error ${response.status}: ${body}`);
    throw new Error(`Resend error ${response.status}: ${body}`);
  }
}

async function sendWithSmtp(input: SendEmailInput) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && (process.env.SMTP_PASSWORD || process.env.SMTP_PASS)
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '',
          }
        : undefined,
  });

  await transporter.sendMail({
    from: getFromAddress(),
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}

export async function sendEmail(input: SendEmailInput) {
  if (process.env.RESEND_API_KEY) {
    await sendWithResend(input);
    return;
  }

  if (process.env.SMTP_HOST) {
    await sendWithSmtp(input);
    return;
  }

  // Fallback: логируем в консоль (для разработки)
  console.log('[email stub]', {
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Подтвердите регистрацию в НЕРВ',
    text: `Для подтверждения email перейдите по ссылке: ${verifyUrl}`,
    html: `<p>Добро пожаловать в <strong>НЕРВ</strong>!</p><p>Для подтверждения email нажмите на ссылку:</p><p><a href="${verifyUrl}" style="color:#8B5CF6;font-weight:bold;">${verifyUrl}</a></p><p>Ссылка действительна 24 часа.</p>`,
  });
}
