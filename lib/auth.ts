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

function decodeJwtPayload(token: string): Partial<TokenPayload> | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = isBrowser()
      ? window.atob(normalized)
      : Buffer.from(normalized, 'base64').toString('utf8');
    return JSON.parse(decoded) as Partial<TokenPayload>;
  } catch {
    return null;
  }
}

function getNodeRequire() {
  if (isBrowser()) return null;
  // Keep Node-only modules out of client bundles. This module is intentionally universal.
  return eval('require') as NodeRequire;
}

function getJwtModule() {
  const nodeRequire = getNodeRequire();
  if (!nodeRequire) return null;
  return nodeRequire('jsonwebtoken') as typeof import('jsonwebtoken');
}

export function signAuthToken(payload: TokenPayload) {
  const jwt = getJwtModule();
  if (!jwt) throw new Error('signAuthToken can only be used on the server.');
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const jwt = getJwtModule();
    if (!jwt) {
      const decoded = decodeJwtPayload(token);
      return typeof decoded?.userId === 'number' && typeof decoded?.email === 'string'
        ? { userId: decoded.userId, email: decoded.email }
        : null;
    }
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

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

export function getAuthUserIdFromCookiesServer() {
  if (isBrowser()) return null;

  const nodeRequire = getNodeRequire();
  if (!nodeRequire) return null;

  const { cookies } = nodeRequire('next/headers') as typeof import('next/headers');
  const cookieStore = cookies();
  const explicitUserId = cookieStore.get(USER_ID_COOKIE_NAME)?.value;

  if (explicitUserId && !Number.isNaN(Number(explicitUserId))) {
    return Number(explicitUserId);
  }

  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  return payload?.userId ?? null;
}

export function getAuthUserIdFromCookies() {
  return isBrowser() ? getAuthUserIdFromCookiesClient() : getAuthUserIdFromCookiesServer();
}

export async function getCurrentUserServer(): Promise<CurrentUser | null> {
  const userId = getAuthUserIdFromCookiesServer();
  if (!userId) return null;

  const { prisma } = await import('./prisma');
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
    },
  });
}

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

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return isBrowser() ? getCurrentUserClient() : getCurrentUserServer();
}
