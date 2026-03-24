import { Resend } from 'resend';

type NewPostEmailInput = {
  to: string;
  title: string;
  excerpt?: string;
  postUrl: string;
  unsubscribeUrl: string;
};

type PendingCommentInput = {
  id: string;
  name: string | null;
  body: string;
  contentType: string;
  contentSlug: string;
  approveUrl: string;
  rejectUrl: string;
};

const resendApiKey = import.meta.env.RESEND_API_KEY;
const emailFrom = import.meta.env.EMAIL_FROM || 'studio@example.com';

export const hasResend = Boolean(resendApiKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function renderNewPostEmail(input: NewPostEmailInput): { html: string; text: string } {
  const excerpt = input.excerpt ? `<p style="color:#6f675d;margin:0 0 14px">${escapeHtml(input.excerpt)}</p>` : '';

  return {
    html: `<!doctype html><html><body style="margin:0;padding:24px;background:#f7f4ee;color:#1f1d1a;font-family:Georgia,serif"><table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#fdfbf7;border:1px solid #dbd2c6"><tr><td style="padding:24px"><h1 style="margin:0 0 12px;font-size:24px;line-height:1.3">${escapeHtml(input.title)}</h1>${excerpt}<p style="margin:0 0 16px"><a href="${input.postUrl}" style="color:#1f1d1a">Read now</a></p><p style="margin:0;font-size:14px;color:#6f675d">Unsubscribe: <a href="${input.unsubscribeUrl}">${input.unsubscribeUrl}</a></p></td></tr></table></body></html>`,
    text: `${input.title}\n\n${input.excerpt || ''}\n\nRead now: ${input.postUrl}\nUnsubscribe: ${input.unsubscribeUrl}`,
  };
}

export async function sendNewPostEmail(input: NewPostEmailInput): Promise<void> {
  if (!resend) throw new Error('RESEND_API_KEY is not configured');
  const body = renderNewPostEmail(input);
  await resend.emails.send({
    from: emailFrom,
    to: input.to,
    subject: input.title,
    html: body.html,
    text: body.text,
    headers: {
      'List-Unsubscribe': `<${input.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
}

export async function sendConfirmationEmail(
  to: string,
  confirmUrl: string,
  unsubscribeUrl: string,
): Promise<void> {
  if (!resend) throw new Error('RESEND_API_KEY is not configured');
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f7f4ee;color:#1f1d1a;font-family:Georgia,serif"><table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#fdfbf7;border:1px solid #dbd2c6"><tr><td style="padding:24px"><h1 style="margin:0 0 12px;font-size:22px;line-height:1.3">Confirm your subscription</h1><p style="margin:0 0 16px;color:#6f675d">Click the link below to confirm your email address and start receiving updates.</p><p style="margin:0 0 20px"><a href="${confirmUrl}" style="color:#1f1d1a;font-weight:600">Confirm subscription</a></p><p style="margin:0;font-size:13px;color:#6f675d">If you didn't subscribe, ignore this or <a href="${unsubscribeUrl}" style="color:#6f675d">unsubscribe</a>.</p></td></tr></table></body></html>`;
  const text = `Confirm your subscription\n\nConfirm here: ${confirmUrl}\n\nIf you didn't subscribe, ignore this or unsubscribe: ${unsubscribeUrl}`;
  await resend.emails.send({
    from: emailFrom,
    to,
    subject: 'Confirm your subscription',
    html,
    text,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
}

export async function sendModerationDigestEmail(
  to: string,
  comment: PendingCommentInput,
): Promise<void> {
  if (!resend) throw new Error('RESEND_API_KEY is not configured');
  const author = comment.name ? escapeHtml(comment.name) : 'Anonymous';
  const body = escapeHtml(comment.body);
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f7f4ee;color:#1f1d1a;font-family:Georgia,serif"><table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#fdfbf7;border:1px solid #dbd2c6"><tr><td style="padding:24px"><h1 style="margin:0 0 12px;font-size:20px">New comment pending</h1><p style="margin:0 0 4px;color:#6f675d;font-size:14px">${escapeHtml(comment.contentType)} / ${escapeHtml(comment.contentSlug)}</p><p style="margin:0 0 4px;font-size:14px;color:#6f675d">From: ${author}</p><blockquote style="margin:12px 0;border-left:3px solid #dbd2c6;padding-left:12px;color:#1f1d1a">${body}</blockquote><p style="margin:16px 0 8px"><a href="${comment.approveUrl}" style="color:#6b7a63;font-weight:600">Approve</a> &nbsp;|&nbsp; <a href="${comment.rejectUrl}" style="color:#9e7070">Reject</a></p></td></tr></table></body></html>`;
  const text = `New comment pending on ${comment.contentType}/${comment.contentSlug}\n\nFrom: ${comment.name || 'Anonymous'}\n\n${comment.body}\n\nApprove: ${comment.approveUrl}\nReject:  ${comment.rejectUrl}`;
  await resend.emails.send({
    from: emailFrom,
    to,
    subject: `New comment pending: ${comment.contentType}/${comment.contentSlug}`,
    html,
    text,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
