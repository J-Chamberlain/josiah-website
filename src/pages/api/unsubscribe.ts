import type { APIRoute } from 'astro';
import { supabaseAdmin, hasSupabase } from '../../lib/supabase';
import { hasSigningSecret, verifySignedToken } from '../../lib/signed-links';

export const GET: APIRoute = async ({ url, redirect }) => {
  const base = (import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321').replace(/\/$/, '');
  const id = url.searchParams.get('id');
  const sig = url.searchParams.get('sig');

  if (!id || !sig) return redirect('/subscribe?status=confirm_invalid', 302);
  if (!hasSigningSecret) {
    return new Response('Signing secret is not configured.', { status: 501 });
  }

  if (!verifySignedToken(id, sig)) {
    return redirect('/subscribe?status=confirm_invalid', 302);
  }

  if (!hasSupabase || !supabaseAdmin) {
    return new Response('Supabase is not configured.', { status: 501 });
  }

  const { error } = await supabaseAdmin
    .from('subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return new Response('Failed to unsubscribe.', { status: 500 });
  }

  return redirect('/subscribe?status=unsubscribed', 302);
};
