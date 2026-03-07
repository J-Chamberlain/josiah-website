import { createHmac, timingSafeEqual } from 'node:crypto';

function getSecret(): string {
  return import.meta.env.MODERATION_SIGNING_SECRET || import.meta.env.SUBSCRIBE_SIGNING_SECRET || 'dev-secret';
}

export function signToken(payload: string): string {
  const hmac = createHmac('sha256', getSecret());
  hmac.update(payload);
  return hmac.digest('hex');
}

export function verifySignedToken(payload: string, signature: string): boolean {
  const expected = signToken(payload);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
