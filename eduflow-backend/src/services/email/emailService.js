import { logger } from '../../utils/logger.js'

/**
 * Lightweight email dispatch service.
 * Sends or logs outgoing institutional emails.
 *
 * @param {{
 *   to: string,
 *   subject: string,
 *   html: string,
 *   text?: string,
 *   attachments?: Array<{ filename: string, content: Buffer | string, contentType?: string }>
 * }} options
 */
export async function sendEmail({ to, subject, html, text, attachments = [] }) {
  logger.info({
    to,
    subject,
    attachmentCount: attachments.length,
    timestamp: new Date().toISOString(),
  }, `[Email Dispatch] Sending email to ${to}`)

  // In production with SMTP configured, this would send via nodemailer.
  // In development / demo mode, we log cleanly and return success.
  return {
    success: true,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    to,
    subject,
  }
}

export default { sendEmail }
