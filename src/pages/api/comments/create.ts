import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabaseAdmin, hasSupabase } from '../../../lib/supabase';
import { runRuleModeration } from '../../../lib/moderation';
import { hasResend, sendModerationDigestEmail } from '../../../lib/email';
import { signToken } from '../../../lib/signed-links';

const schema = z.object({
  content_type: z.enum(['essay', 'project', 'ideaOutline', 'gallery']),
  content_slug: z.string().min(1),
  name: z.string().trim().max(100).optional(),
  email: z.string().email(),
  body: z.string().trim().min(4).max(5000),
  return_to: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const parsed = schema.safeParse({
    content_type: String(formData.get('content_type') || ''),
    content_slug: String(formData.get('content_slug') || ''),
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    body: String(formData.get('body') || ''),
    return_to: String(formData.get('return_to') || ''),
  });

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid comment payload' }), { status: 400 });
  }

  const returnTo = parsed.data.return_to && parsed.data.return_to.startsWith('/')
    ? parsed.data.return_to
    : `/${parsed.data.content_type === 'ideaOutline' ? 'ideas' : `${parsed.data.content_type}s`}/${parsed.data.content_slug}`;

  const rules = runRuleModeration(parsed.data.body);
  const status = rules?.status ?? 'pending';
  const moderation_source = rules?.source ?? 'rules';
  const moderation_reason = rules?.reason ?? 'requires_review';

  if (!hasSupabase || !supabaseAdmin) {
    return Response.redirect(`${returnTo}?comment_status=pending`, 302);
  }

  const { data: inserted, error } = await supabaseAdmin
    .from('comments')
    .insert({
      content_type: parsed.data.content_type,
      content_slug: parsed.data.content_slug,
      name: parsed.data.name || null,
      email: parsed.data.email.toLowerCase(),
      body: parsed.data.body,
      status,
      moderation_source,
      moderation_reason,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    return new Response(JSON.stringify({ error: 'Failed to save comment.' }), { status: 500 });
  }

  // Send moderation digest email to author for any pending comment
  if (status === 'pending' && hasResend) {
    const authorEmail = import.meta.env.AUTHOR_EMAIL;
    if (authorEmail) {
      const base = (import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321').replace(/\/$/, '');
      const id = inserted.id;
      const sig = signToken(id);
      const approveUrl = `${base}/api/comments/moderate?id=${id}&action=approve&token=${id}&sig=${sig}`;
      const rejectUrl = `${base}/api/comments/moderate?id=${id}&action=reject&token=${id}&sig=${sig}`;
      try {
        await sendModerationDigestEmail(authorEmail, {
          id,
          name: parsed.data.name || null,
          body: parsed.data.body,
          contentType: parsed.data.content_type,
          contentSlug: parsed.data.content_slug,
          approveUrl,
          rejectUrl,
        });
      } catch (err) {
        console.error('[comments/create] Failed to send moderation email:', err);
      }
    }
  }

  return Response.redirect(`${returnTo}?comment_status=${encodeURIComponent(status)}`, 302);
};
