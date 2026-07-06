type Entry<T> = { value: T; expiresAt: number };
const cache = new Map<string, Entry<unknown>>();

export async function cached<T>(key: string, ttlMs: number, factory: () => Promise<T>) {
  const existing = cache.get(key) as Entry<T> | undefined;
  if (existing && existing.expiresAt > Date.now()) return existing.value;
  const value = await factory();
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}
