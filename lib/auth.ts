import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export const AUTH_COOKIE_NAME = 'nerv_token';
export const USER_ID_COOKIE_NAME = 'userId';

type TokenPayload = {
  userId: number;
  email: string;
};

type CurrentUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  balance: number;
  isModerator: boolean;
  level: number;
  experience: number;
  theme: string;
  createdAt: Date;
  emailVerified: Date | null; // ✅ ДОБАВЛЕНО
};

function getJwtSecret() {
  return process.env.JWT_SECRET || 'nerv-development-secret';
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function parseCookieHeader(cookieHeader: string) {
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, item) => {
    const [rawKey, ...rawValue] = item.trim().split('=');
    if (!rawKey) return acc;
    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {});
}

export function signAuthToken(payload: TokenPayload) {
  if (isBrowser()) {
    throw new Error('signAuthToken can only be used on the server.');
  }
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    if (isBrowser()) {
      const [, payload] = token.split('.');
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = window.atob(normalized);
      const parsed = JSON.parse(decoded) as Partial<TokenPayload>;
      if (typeof parsed.userId === 'number' && typeof parsed.email === 'string') {
        return { userId: parsed.userId, email: parsed.email };
      }
      return null;
    }
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

// ✅ Серверная версия (использует next/headers через динамический импорт)
export function getAuthUserIdFromCookiesServer() {
  if (isBrowser()) return null;

  try {
    // ✅ Динамический импорт next/headers только на сервере
    const { cookies } = require('next/headers');
    const cookieStore = cookies();
    const explicitUserId = cookieStore.get(USER_ID_COOKIE_NAME)?.value;
    if (explicitUserId && !Number.isNaN(Number(explicitUserId))) {
      return Number(explicitUserId);
    }
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyAuthToken(token);
    return payload?.userId ?? null;
  } catch (error) {
    console.error('Error loading next/headers:', error);
    return null;
  }
}

// ✅ Клиентская версия (использует document.cookie)
export function getAuthUserIdFromCookiesClient() {
  if (!isBrowser()) return null;
  const parsedCookies = parseCookieHeader(document.cookie || '');
  const explicitUserId = parsedCookies[USER_ID_COOKIE_NAME];
  if (explicitUserId && !Number.isNaN(Number(explicitUserId))) {
    return Number(explicitUserId);
  }
  const token = parsedCookies[AUTH_COOKIE_NAME];
  if (!token) return null;
  const payload = verifyAuthToken(token);
  return payload?.userId ?? null;
}

// ✅ Универсальная версия
export function getAuthUserIdFromCookies() {
  return isBrowser() ? getAuthUserIdFromCookiesClient() : getAuthUserIdFromCookiesServer();
}

// ✅ Серверная версия getCurrentUser
export async function getCurrentUserServer(): Promise<CurrentUser | null> {
  if (isBrowser()) return null;
  const userId = getAuthUserIdFromCookiesServer();
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      balance: true,
      isModerator: true,
      level: true,
      experience: true,
      theme: true,
      createdAt: true,
      emailVerified: true, // ✅ ДОБАВЛЕНО
    },
  });
}

// ✅ Клиентская версия getCurrentUser
async function getCurrentUserClient(): Promise<CurrentUser | null> {
  if (!isBrowser()) return null;
  try {
    const response = await fetch('/api/profile', { credentials: 'include' });
    if (!response.ok) return null;
    const data = await response.json();
    return (data?.user ?? data) as CurrentUser;
  } catch {
    return null;
  }
}

// ✅ Универсальная версия getCurrentUser
export async function getCurrentUser(): Promise<CurrentUser | null> {
  return isBrowser() ? getCurrentUserClient() : getCurrentUserServer();
}