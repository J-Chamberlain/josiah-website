import type { APIRoute } from 'astro';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { supabaseAdmin, hasSupabase } from '../../lib/supabase';
import { hasResend, sendConfirmationEmail } from '../../lib/email';
import { hasSigningSecret, signToken } from '../../lib/signed-links';

const schema = z.object({
  email: z.string().email(),
  website: z.string().optional(),
});

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const parsed = schema.safeParse({
    email: String(formData.get('email') || ''),
    website: String(formData.get('website') || ''),
  });

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  // Honeypot: silently accept but do nothing
  if (parsed.data.website) {
    return redirect('/subscribe?status=pending', 302);
  }

  const email = parsed.data.email.toLowerCase();
  const confirmToken = randomBytes(24).toString('hex');
  const confirmTokenHash = sha256(confirmToken);
  const confirmTokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  if (!hasSupabase || !supabaseAdmin) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Supabase is not configured yet. Configure env vars to enable subscriptions.',
      }),
      { status: 501 },
    );
  }
  if (!hasSigningSecret) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Signing secret is not configured. Set MODERATION_SIGNING_SECRET or SUBSCRIBE_SIGNING_SECRET.',
      }),
      { status: 501 },
    );
  }

  const { data: subscriber, error } = await supabaseAdmin
    .from('subscribers')
    .upsert(
      {
        email,
        status: 'pending',
        confirm_token_hash: confirmTokenHash,
        confirm_token_expires_at: confirmTokenExpiresAt,
        unsubscribed_at: null,
      },
      { onConflict: 'email' },
    )
    .select('id')
    .single();

  if (error || !subscriber) {
    return new Response(JSON.stringify({ error: 'Failed to register subscription.' }), { status: 500 });
  }

  const base = (import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321').replace(/\/$/, '');
  const confirmUrl = `${base}/api/subscribe/confirm?token=${encodeURIComponent(confirmToken)}`;

  // Unsubscribe URL derived from subscriber ID using HMAC — no raw token stored
  const unsubscribeUrl = `${base}/api/unsubscribe?id=${encodeURIComponent(subscriber.id)}&sig=${encodeURIComponent(signToken(subscriber.id))}`;

  if (hasResend) {
    try {
      await sendConfirmationEmail(email, confirmUrl, unsubscribeUrl);
    } catch (err) {
      console.error('[subscribe] Failed to send confirmation email:', err);
      // Don't surface email errors to the user — subscriber row is already created
    }
  }

  return redirect('/subscribe?status=pending', 302);
};
