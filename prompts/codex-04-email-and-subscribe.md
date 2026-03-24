# Codex Prompt 04 - Email And Subscribe

Implement compliant email capture and automated new-post notifications.

## Build
- Add `/api/subscribe` endpoint
- Add `/api/subscribe/confirm` endpoint (double opt-in)
- Add `/api/unsubscribe` endpoint
- Validate email input with server-side checks
- Store subscribers in Supabase with lifecycle fields
- Create Sanity publish webhook endpoint
- On new public post publish, send email via Resend to `active` subscribers

## Requirements
- Subscriber list owned by project database
- Basic anti-abuse protections (honeypot field; rate limiting deferred)
- Confirmation tokens expire after 48 hours; expired tokens return a clear error and prompt re-subscription
- Include unsubscribe URL in every email body
- Include `List-Unsubscribe` and `List-Unsubscribe-Post` headers
- Unsubscribed addresses must never receive publish emails
- New-post email template: HTML + plain-text multipart; fields: title, excerpt, post URL, unsubscribe URL; minimal single-column layout

## DNS Prerequisites (Do First)
- Configure sender-domain SPF, DKIM, and DMARC records
- Verify domain in Resend before webhook testing
- Document expected DNS propagation delays

## Deliverables
- SQL schema for subscribers (`status`, `confirmed_at`, `unsubscribed_at`, token hashes, `confirm_token_expires_at`)
- API route handlers
- Webhook verification strategy
- `.env.example` additions
