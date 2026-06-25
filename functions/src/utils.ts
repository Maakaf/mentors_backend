import * as admin from "firebase-admin";
import * as crypto from "crypto";

/** Generate a cryptographically random 6-digit OTP string. */
export function generateOTP(): string {
  // crypto.randomInt is uniformly distributed and avoids modulo bias
  return (crypto.randomInt(100000, 1000000)).toString();
}

/** Return a Firestore Timestamp N minutes from now (default 15). */
export function getOTPExpiry(minutesFromNow = 15): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + minutesFromNow * 60 * 1000)
  );
}

/** Normalize an availability value to the valid enum. */
export function parseAvailability(value: unknown): "available" | "unavailable" {
  return value === "unavailable" ? "unavailable" : "available";
}

/**
 * Constant-time string comparison — prevents timing attacks on OTP/code checks.
 * Returns true only if both strings are identical.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a.padEnd(32));
  const bufB = Buffer.from(b.padEnd(32));
  // Both buffers must be the same length for timingSafeEqual
  return crypto.timingSafeEqual(bufA, bufB) && a.length === b.length;
}
