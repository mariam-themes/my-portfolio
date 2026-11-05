import type { IInquiry } from '@/models/Inquiry';
import { getWhatsAppUrl } from './country-codes';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'Mariam Aljumaiah Studio <notifications@mariammjstudio.com>';
const NOTIFY_EMAIL = process.env.INQUIRY_NOTIFY_EMAIL || 'Info@mariammjstudio.com';

// Cache to prevent duplicate notification emails for the same inquiry document in memory
const sentInquiryIds = new Set<string>();

function getDashboardUrl(): string {
  const rawBase =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    'https://mariammjstudio.com';
  const base = rawBase.startsWith('http') ? rawBase : `https://${rawBase}`;
  return `${base.replace(/\/+$/, '')}/admin/inquiries`;
}

function escapeHtml(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(date?: Date | string): string {
  try {
    const d = date ? new Date(date) : new Date();
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Asia/Riyadh',
    }).format(d);
  } catch {
    return new Date().toLocaleString('ar-SA');
  }
}

/**
 * Template 1: Visual Identity Purchase Request (طلب شراء هوية بصرية)
 */
function buildPurchaseEmailHtml(inquiry: IInquiry, dashboardUrl: string): string {
  const waUrl = inquiry.phone ? getWhatsAppUrl(inquiry.phone) : '';
  const formattedPrice = inquiry.projectPrice
    ? `${new Intl.NumberFormat('en-US').format(inquiry.projectPrice)} SAR`
    : 'غير محدد';
  const identityName = inquiry.projectRef || inquiry.service;
  const submissionDate = formatDate(inquiry.createdAt);

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>طلب شراء هوية بصرية جديدة</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; direction: rtl; text-align: right;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07); border: 1px solid #e5e7eb;">
    
    <!-- Top Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #16040a 0%, #2e0815 100%); padding: 36px 28px; text-align: center;">
        <span style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; padding: 5px 14px; border-radius: 20px; margin-bottom: 14px; text-transform: uppercase;">
          🛍️ طلب شراء هوية بصرية
        </span>
        <h1 style="margin: 0 0 6px 0; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.4;">
          وصلك طلب شراء جديد من: ${escapeHtml(inquiry.name)}
        </h1>
        <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px;">
          Mariam Aljumaiah Studio — نظام الإشعارات الفورية
        </p>
      </td>
    </tr>

    <!-- Body Container -->
    <tr>
      <td style="padding: 28px;">
        
        <!-- Identity Summary Box -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin-bottom: 24px; padding: 16px;">
          <tr>
            <td style="vertical-align: middle;">
              <span style="display: block; font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; margin-bottom: 4px;">الهوية المطلوبة</span>
              <span style="display: block; font-size: 17px; font-weight: 700; color: #064e3b;">${escapeHtml(identityName)}</span>
            </td>
            <td style="text-align: left; vertical-align: middle;">
              <span style="display: block; font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; margin-bottom: 4px;">السعر</span>
              <span style="display: block; font-size: 18px; font-weight: 800; color: #059669;">${escapeHtml(formattedPrice)}</span>
            </td>
          </tr>
        </table>

        <!-- Details Table -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; width: 140px; font-size: 13px;">اسم المشتري</td>
            <td style="padding: 12px 14px; color: #111827; font-size: 14px; font-weight: 600;">${escapeHtml(inquiry.name)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; font-size: 13px;">البريد الإلكتروني</td>
            <td style="padding: 12px 14px; font-size: 14px;">
              <a href="mailto:${escapeHtml(inquiry.email)}" style="color: #951C30; font-weight: 600; text-decoration: underline;" dir="ltr">${escapeHtml(inquiry.email)}</a>
            </td>
          </tr>
          ${
            inquiry.phone
              ? `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; font-size: 13px;">رقم الهاتف</td>
            <td style="padding: 12px 14px; color: #111827; font-size: 14px;" dir="ltr">
              ${escapeHtml(inquiry.phone)}
            </td>
          </tr>
          `
              : ''
          }
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; font-size: 13px;">رسالة المشتري</td>
            <td style="padding: 12px 14px; color: #374151; font-size: 14px; line-height: 1.6;">${escapeHtml(inquiry.message || 'لا توجد ملاحظات إضافية')}</td>
          </tr>
          <tr>
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; font-size: 13px;">توقيت الطلب</td>
            <td style="padding: 12px 14px; color: #6b7280; font-size: 13px;">${escapeHtml(submissionDate)}</td>
          </tr>
        </table>

        <!-- Actions: WhatsApp and Dashboard -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            ${
              waUrl
                ? `
            <td style="padding: 6px; text-align: center;">
              <a href="${escapeHtml(waUrl)}" target="_blank" style="display: block; background-color: #25D366; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 13px 18px; border-radius: 8px; box-shadow: 0 2px 6px rgba(37, 211, 102, 0.25);">
                💬 محادثة واتساب فورية
              </a>
            </td>
            `
                : ''
            }
            <td style="padding: 6px; text-align: center;">
              <a href="${escapeHtml(dashboardUrl)}" target="_blank" style="display: block; background-color: #951C30; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 13px 18px; border-radius: 8px; box-shadow: 0 2px 6px rgba(149, 28, 48, 0.25);">
                📊 فتح الطلب في لوحة التحكم
              </a>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 18px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
          تم استلام هذا الإشعار تلقائياً من نموذج طلب الهويات المعروضة للبيع بموقعك.<br>
          المستلم: <span dir="ltr">${escapeHtml(NOTIFY_EMAIL)}</span>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Template 2: General Contact / Project Inquiry (نموذج التواصل وطلب المشاريع)
 */
function buildContactEmailHtml(inquiry: IInquiry, dashboardUrl: string): string {
  const waUrl = inquiry.phone ? getWhatsAppUrl(inquiry.phone) : '';
  const submissionDate = formatDate(inquiry.createdAt);

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>طلب مشروع / استفسار جديد</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; direction: rtl; text-align: right;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07); border: 1px solid #e5e7eb;">
    
    <!-- Top Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #16040a 0%, #2e0815 100%); padding: 36px 28px; text-align: center;">
        <span style="display: inline-block; background-color: #951C30; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; padding: 5px 14px; border-radius: 20px; margin-bottom: 14px; text-transform: uppercase;">
          📩 طلب استفسار / مشروع جديد
        </span>
        <h1 style="margin: 0 0 6px 0; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.4;">
          وصلتك رسالة جديدة من: ${escapeHtml(inquiry.name)}
        </h1>
        <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px;">
          Mariam Aljumaiah Studio — استوديو الأعمال
        </p>
      </td>
    </tr>

    <!-- Body Container -->
    <tr>
      <td style="padding: 28px;">
        
        <!-- Details Table -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; width: 140px; font-size: 13px;">اسم العميل</td>
            <td style="padding: 12px 14px; color: #111827; font-size: 14px; font-weight: 600;">${escapeHtml(inquiry.name)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; font-size: 13px;">البريد الإلكتروني</td>
            <td style="padding: 12px 14px; font-size: 14px;">
              <a href="mailto:${escapeHtml(inquiry.email)}" style="color: #951C30; font-weight: 600; text-decoration: underline;" dir="ltr">${escapeHtml(inquiry.email)}</a>
            </td>
          </tr>
          ${
            inquiry.phone
              ? `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; font-size: 13px;">رقم الهاتف</td>
            <td style="padding: 12px 14px; color: #111827; font-size: 14px;" dir="ltr">
              ${escapeHtml(inquiry.phone)}
            </td>
          </tr>
          `
              : ''
          }
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; font-size: 13px;">الخدمة المطلوبة</td>
            <td style="padding: 12px 14px; color: #111827; font-size: 14px; font-weight: 600;">${escapeHtml(inquiry.service)}</td>
          </tr>
          ${
            inquiry.budget
              ? `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; font-size: 13px;">الميزانية المتوقعة</td>
            <td style="padding: 12px 14px; color: #111827; font-size: 14px;">${escapeHtml(inquiry.budget)}</td>
          </tr>
          `
              : ''
          }
          ${
            inquiry.timeline
              ? `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; font-size: 13px;">المدة الزمنية</td>
            <td style="padding: 12px 14px; color: #111827; font-size: 14px;">${escapeHtml(inquiry.timeline)}</td>
          </tr>
          `
              : ''
          }
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; font-size: 13px; vertical-align: top;">نص الرسالة</td>
            <td style="padding: 12px 14px; color: #374151; font-size: 14px; line-height: 1.6;">${escapeHtml(inquiry.message || '—')}</td>
          </tr>
          <tr>
            <td style="padding: 12px 14px; font-weight: 600; color: #6b7280; font-size: 13px;">توقيت الإرسال</td>
            <td style="padding: 12px 14px; color: #6b7280; font-size: 13px;">${escapeHtml(submissionDate)}</td>
          </tr>
        </table>

        <!-- Actions: WhatsApp and Dashboard -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            ${
              waUrl
                ? `
            <td style="padding: 6px; text-align: center;">
              <a href="${escapeHtml(waUrl)}" target="_blank" style="display: block; background-color: #25D366; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 13px 18px; border-radius: 8px; box-shadow: 0 2px 6px rgba(37, 211, 102, 0.25);">
                💬 محادثة واتساب مع العميل
              </a>
            </td>
            `
                : ''
            }
            <td style="padding: 6px; text-align: center;">
              <a href="${escapeHtml(dashboardUrl)}" target="_blank" style="display: block; background-color: #951C30; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 13px 18px; border-radius: 8px; box-shadow: 0 2px 6px rgba(149, 28, 48, 0.25);">
                📊 فتح الرسالة في لوحة التحكم
              </a>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 18px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
          تم استلام هذا الإشعار تلقائياً من نموذج التواصل بموقعك.<br>
          المستلم: <span dir="ltr">${escapeHtml(NOTIFY_EMAIL)}</span>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a notification email for a new inquiry via Resend API.
 * 
 * Safety guarantees:
 * 1. Called ONLY after successful database save.
 * 2. Never throws: failure is logged and does not break user-facing submission.
 * 3. Prevents duplicate sends for the same inquiry ID.
 * 4. Logs errors safely without leaking credentials.
 */
export async function sendNewInquiryNotification(inquiry: IInquiry): Promise<void> {
  const inquiryId = inquiry._id ? String(inquiry._id) : '';

  // Prevent duplicate sends for the same saved inquiry
  if (inquiryId && sentInquiryIds.has(inquiryId)) {
    console.warn(`[email] Notification already sent for inquiry ${inquiryId}, skipping duplicate.`);
    return;
  }

  const targetEmail = NOTIFY_EMAIL.trim();

  if (!RESEND_API_KEY) {
    console.warn(
      `[email] Notification skipped: RESEND_API_KEY is not set in environment. Inquiry #${inquiryId} was safely saved to DB.`
    );
    return;
  }

  if (!targetEmail) {
    console.warn(
      `[email] Notification skipped: INQUIRY_NOTIFY_EMAIL is empty. Inquiry #${inquiryId} was safely saved to DB.`
    );
    return;
  }

  const isPurchase = inquiry.type === 'purchase';
  const dashboardUrl = getDashboardUrl();

  const subject = isPurchase
    ? `🛍️ طلب شراء هوية بصرية: ${inquiry.projectRef || inquiry.service} — من ${inquiry.name}`
    : `📩 طلب مشروع جديد من: ${inquiry.name} — ${inquiry.service}`;

  const html = isPurchase
    ? buildPurchaseEmailHtml(inquiry, dashboardUrl)
    : buildContactEmailHtml(inquiry, dashboardUrl);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [targetEmail],
        replyTo: inquiry.email,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[email] Resend API error response:', {
        status: response.status,
        statusText: response.statusText,
        details: errorText,
      });
      return;
    }

    if (inquiryId) {
      sentInquiryIds.add(inquiryId);
      // Keep memory cache under control
      if (sentInquiryIds.size > 500) {
        const first = sentInquiryIds.values().next().value;
        if (first) sentInquiryIds.delete(first);
      }
    }

    console.log(`[email] Successfully sent notification to ${targetEmail} for inquiry #${inquiryId}`);
  } catch (error) {
    console.error(
      '[email] Unexpected failure sending notification email:',
      error instanceof Error ? error.message : error
    );
  }
}
