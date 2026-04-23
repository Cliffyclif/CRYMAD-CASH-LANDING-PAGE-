/**
 * Per-process in-memory TTL cache.
 *
 * Use for slow TygaBank proxy reads where a few-second staleness is fine
 * (user profile, wallets, transactions). Keyed by anything stringifiable.
 * Not for writes or auth-sensitive one-shots.
 */

type Entry<T> = { v: T; exp: number };

const store = new Map<string, Entry<unknown>>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.exp > now) return hit.v;
  const v = await loader();
  store.set(key, { v, exp: now + ttlMs });
  return v;
}

export function invalidate(prefix: string): void {
  for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
}
