interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// Prune expired entries every 10 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  store.forEach((bucket, key) => {
    if (now > bucket.resetAt) store.delete(key);
  });
}, 10 * 60 * 1000).unref();

/**
 * Check whether `key` is within the allowed rate.
 * @returns true if the request is allowed, false if it should be blocked.
 */
export function checkRateLimit(
  key: string,
  max = 5,
  windowMs = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) return false;

  bucket.count++;
  return true;
}

/** Clear rate-limit state for a key (e.g. after successful verification). */
export function clearRateLimit(key: string): void {
  store.delete(key);
}
