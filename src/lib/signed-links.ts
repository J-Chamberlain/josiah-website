import { createHmac, timingSafeEqual } from 'node:crypto';

const SIGNING_SECRET = import.meta.env.MODERATION_SIGNING_SECRET || import.meta.env.SUBSCRIBE_SIGNING_SECRET;

export const hasSigningSecret = Boolean(SIGNING_SECRET);

function getSecret(): string {
  if (!SIGNING_SECRET) {
    throw new Error('Signing secret is not configured. Set MODERATION_SIGNING_SECRET or SUBSCRIBE_SIGNING_SECRET.');
  }
  return SIGNING_SECRET;
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
