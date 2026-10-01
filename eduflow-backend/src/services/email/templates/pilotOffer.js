/**
 * Pilot Offer Email Template
 *
 * @param {{
 *   contactName: string,
 *   collegeName: string,
 *   senderName?: string,
 *   senderEmail?: string,
 *   senderPhone?: string
 * }} data
 */
export function getPilotOfferEmailHtml(data) {
  const {
    contactName = 'Esteemed Leader',
    collegeName = 'your institution',
    senderName = 'Shaik Abdul Sammed',
    senderEmail = 'abdul@eduflow.app',
    senderPhone = '+91 90100 00000',
  } = data

  const subject = 'Your Free NAAC Pilot Report — EduFlow AI OS'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #1e40af; color: #ffffff; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.01em;">EduFlow AI OS</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #bfdbfe;">Autonomous Institutional Intelligence Platform</p>
    </div>

    <div style="padding: 28px 24px;">
      <p style="font-size: 16px; margin-top: 0;">Dear <strong>${contactName}</strong>,</p>

      <p style="font-size: 15px; color: #334155;">
        Thank you for expressing interest in accelerated NAAC accreditation reporting for <strong>${collegeName}</strong>.
      </p>

      <p style="font-size: 15px; color: #334155;">
        Preparing NAAC SSR documentation manually typically takes institutions between 4 to 6 months of faculty time. With <strong>EduFlow AI OS</strong>, our specialized AI Accreditation Officer synthesizes quantitative institutional data, faculty publications, and student metrics to generate fully compliant <strong>Criteria 1–7 SSR drafts in just 3 days</strong>.
      </p>

      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #1e3a8a;">Your Complimentary Pilot Report Includes:</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #1e40af;">
          <li>Automated gap analysis for NAAC Criterion 3 (Research & Innovations)</li>
          <li>Executive accreditation readiness score card (0–100 scale)</li>
          <li>Instant institutional PDF export ready for IQAC internal review</li>
        </ul>
      </div>

      <p style="font-size: 15px; color: #334155;">
        To activate your free pilot without any commitment, simply reply to this email with your preferred date for a 15-minute briefing, or contact us directly below:
      </p>

      <div style="margin: 24px 0; text-align: center;">
        <a href="mailto:${senderEmail}?subject=Re:%20Activation%20of%20NAAC%20Free%20Pilot%20Report%20-%20${encodeURIComponent(collegeName)}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">
          Confirm Free Pilot Activation →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

      <p style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Warm regards,</p>
      <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin: 0;">${senderName}</p>
      <p style="font-size: 13px; color: #64748b; margin: 2px 0;">Lead Accreditation Automation Consultant, EduFlow AI OS</p>
      <p style="font-size: 13px; color: #64748b; margin: 2px 0;">Direct: ${senderPhone} | Email: ${senderEmail}</p>
      <p style="font-size: 13px; color: #64748b; margin: 2px 0;">Hyderabad, India · <a href="https://eduflow.app" style="color: #2563eb; text-decoration: none;">eduflow.app</a></p>
    </div>

    <div style="background-color: #f1f5f9; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      © ${new Date().getFullYear()} EduFlow AI OS. All rights reserved. Confidential.
    </div>
  </div>
</body>
</html>
  `.trim()

  return { subject, html }
}

export default getPilotOfferEmailHtml
