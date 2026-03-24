import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { supabaseAdmin, hasSupabase } from '../../../lib/supabase';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export const GET: APIRoute = async ({ url, redirect }) => {
  const base = (import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321').replace(/\/$/, '');
  const token = url.searchParams.get('token');
  if (!token) {
    return redirect('/subscribe?status=confirm_invalid', 302);
  }

  if (!hasSupabase || !supabaseAdmin) {
    return new Response('Supabase is not configured.', { status: 501 });
  }

  const tokenHash = sha256(token);
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('id, confirm_token_expires_at')
    .eq('confirm_token_hash', tokenHash)
    .maybeSingle();

  if (error || !data) {
    return redirect('/subscribe?status=confirm_invalid', 302);
  }

  if (data.confirm_token_expires_at && new Date(data.confirm_token_expires_at).getTime() < Date.now()) {
    return redirect('/subscribe?status=confirm_expired', 302);
  }

  await supabaseAdmin
    .from('subscribers')
    .update({ status: 'active', confirmed_at: now, confirm_token_hash: null })
    .eq('id', data.id);

  return redirect('/subscribe?status=confirmed', 302);
};
