/**
 * @jest-environment node
 */

import jwt from 'jsonwebtoken';
import {
  signAuthToken,
  verifyAuthToken,
  AUTH_COOKIE_NAME,
  USER_ID_COOKIE_NAME,
} from '@/lib/auth';

jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

const TEST_SECRET = 'nerv-development-secret';

describe('signAuthToken', () => {
  it('создаёт JWT с userId и email', () => {
    const token = signAuthToken({ userId: 1, email: 'test@nerv.local' });
    expect(typeof token).toBe('string');

    const decoded = jwt.decode(token) as any;
    expect(decoded.userId).toBe(1);
    expect(decoded.email).toBe('test@nerv.local');
  });

  it('срок действия токена — 7 дней', () => {
    const token = signAuthToken({ userId: 1, email: 'test@nerv.local' });
    const decoded = jwt.decode(token) as any;
    const sevenDays = 7 * 24 * 60 * 60;
    const margin = 10;
    expect(decoded.exp - decoded.iat).toBeGreaterThanOrEqual(sevenDays - margin);
    expect(decoded.exp - decoded.iat).toBeLessThanOrEqual(sevenDays + margin);
  });
});

describe('verifyAuthToken', () => {
  it('возвращает payload для валидного токена', () => {
    const token = signAuthToken({ userId: 42, email: 'user@nerv.local' });
    const payload = verifyAuthToken(token);
    expect(payload).toMatchObject({ userId: 42, email: 'user@nerv.local' });
  });

  it('возвращает null для невалидного токена', () => {
    const payload = verifyAuthToken('invalid-token');
    expect(payload).toBeNull();
  });

  it('возвращает null для пустой строки', () => {
    const payload = verifyAuthToken('');
    expect(payload).toBeNull();
  });

  it('возвращает null для токена с истекшим сроком', () => {
    const expiredToken = jwt.sign(
      { userId: 1, email: 'test@nerv.local' },
      TEST_SECRET,
      { expiresIn: '0s' }
    );
    const payload = verifyAuthToken(expiredToken);
    expect(payload).toBeNull();
  });

  it('возвращает null для токена с другой подписью', () => {
    const token = jwt.sign(
      { userId: 1, email: 'test@nerv.local' },
      'wrong-secret'
    );
    const payload = verifyAuthToken(token);
    expect(payload).toBeNull();
  });

  it('возвращает null для токена без userId', () => {
    const token = jwt.sign({ email: 'test@nerv.local' }, TEST_SECRET);
    const payload = verifyAuthToken(token);
    expect(payload).toBeNull();
  });

  it('возвращает null для токена без email', () => {
    const token = jwt.sign({ userId: 1 }, TEST_SECRET);
    const payload = verifyAuthToken(token);
    expect(payload).toBeNull();
  });
});

describe('Константы', () => {
  it('AUTH_COOKIE_NAME = nerv_token', () => {
    expect(AUTH_COOKIE_NAME).toBe('nerv_token');
  });

  it('USER_ID_COOKIE_NAME = userId', () => {
    expect(USER_ID_COOKIE_NAME).toBe('userId');
  });
});
