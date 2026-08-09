import type { IInquiry } from '@/models/Inquiry';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const NOTIFY_EMAIL = process.env.INQUIRY_NOTIFY_EMAIL;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildInquiryEmailHtml(inquiry: IInquiry): string {
  const rows: Array<[string, string]> = [
    ['Name', inquiry.name],
    ['Email', inquiry.email],
    ['Phone', inquiry.phone || '—'],
    ['Service', inquiry.service],
    ['Budget', inquiry.budget || '—'],
    ['Timeline', inquiry.timeline || '—'],
    ['Message', inquiry.message || '—'],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;font-weight:600;color:#47403a;width:140px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 0;color:#151210;">${escapeHtml(value)}</td></tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<body>
  <p style="font-family:Arial,sans-serif;color:#151210;">A new inquiry was submitted on the portfolio site.</p>
  <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:560px;">
    ${rowsHtml}
  </table>
</body>
</html>`;
}

/**
 * Sends a notification email for a new inquiry via Resend.
 * Never throws: a missing/failing email provider is logged and must not
 * break the API response that created the inquiry.
 */
export async function sendNewInquiryNotification(inquiry: IInquiry): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('[email] Notification skipped: RESEND_API_KEY is not set.');
    return;
  }
  if (!NOTIFY_EMAIL) {
    console.warn('[email] Notification skipped: INQUIRY_NOTIFY_EMAIL is not set.');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [NOTIFY_EMAIL],
        replyTo: inquiry.email,
        subject: `New inquiry from ${inquiry.name} — ${inquiry.service}`,
        html: buildInquiryEmailHtml(inquiry),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Resend responded with ${response.status}: ${errorBody}`);
    }
  } catch (error) {
    console.error('[email] Failed to send inquiry notification:', error);
  }
}