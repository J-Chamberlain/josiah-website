import type { APIRoute } from 'astro';
import { z } from 'zod';
import { hasResend, sendNewPostEmail } from '../../../lib/email';
import { hasSupabase, supabaseAdmin } from '../../../lib/supabase';
import { signToken } from '../../../lib/signed-links';

const schema = z.object({
  title: z.string().min(1),
  excerpt: z.string().optional(),
  postUrl: z.string().url(),
  visibility: z.enum(['public', 'unlisted']).default('public'),
});

export const POST: APIRoute = async ({ request }) => {
  const secret = request.headers.get('x-webhook-secret');
  if (!import.meta.env.SANITY_WEBHOOK_SECRET || secret !== import.meta.env.SANITY_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = schema.safeParse(await request.json());
  if (!payload.success) {
    return new Response('Invalid payload', { status: 400 });
  }

  if (payload.data.visibility === 'unlisted') {
    return new Response(JSON.stringify({ ok: true, skipped: 'unlisted' }), { status: 200 });
  }

  if (!hasResend || !hasSupabase || !supabaseAdmin) {
    return new Response(
      JSON.stringify({ ok: false, message: 'Resend or Supabase not configured; webhook accepted without sends.' }),
      { status: 202 },
    );
  }

  const { data: subscribers } = await supabaseAdmin
    .from('subscribers')
    .select('id, email')
    .eq('status', 'active')
    .is('unsubscribed_at', null);

  if (!subscribers || subscribers.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 });
  }

  const base = (import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321').replace(/\/$/, '');

  const results = await Promise.allSettled(
    subscribers.map(async (subscriber) => {
      // Derive unsubscribe URL from subscriber ID using HMAC — consistent with /api/unsubscribe
      const unsubscribeUrl = `${base}/api/unsubscribe?id=${encodeURIComponent(subscriber.id)}&sig=${encodeURIComponent(signToken(subscriber.id))}`;
      await sendNewPostEmail({
        to: subscriber.email,
        title: payload.data.title,
        excerpt: payload.data.excerpt,
        postUrl: payload.data.postUrl,
        unsubscribeUrl,
      });
    }),
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - sent;
  if (failed > 0) {
    console.warn(`[webhook] New-post email send failures: ${failed}/${results.length}`);
  }

  return new Response(JSON.stringify({ ok: true, sent, failed }), { status: 200 });
};
