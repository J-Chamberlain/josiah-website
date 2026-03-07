import type { APIRoute } from 'astro';
import { supabaseAdmin, hasSupabase } from '../../../lib/supabase';
import { verifySignedToken } from '../../../lib/signed-links';

export const GET: APIRoute = async ({ url }) => {
  const commentId = url.searchParams.get('id');
  const action = url.searchParams.get('action');
  const token = url.searchParams.get('token');
  const sig = url.searchParams.get('sig');

  if (!commentId || !action || !token || !sig) {
    return new Response('Missing moderation params', { status: 400 });
  }
  if (!verifySignedToken(token, sig)) {
    return new Response('Invalid signature', { status: 403 });
  }
  if (action !== 'approve' && action !== 'reject') {
    return new Response('Invalid action', { status: 400 });
  }
  if (!hasSupabase || !supabaseAdmin) {
    return new Response('Supabase is not configured.', { status: 501 });
  }

  await supabaseAdmin
    .from('comments')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      moderation_source: 'manual',
      moderation_reason: `manual_${action}`,
      moderated_at: new Date().toISOString(),
    })
    .eq('id', commentId);

  return new Response(`Comment ${action}d.`, { status: 200 });
};
