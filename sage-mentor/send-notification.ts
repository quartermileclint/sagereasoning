/**
 * send-notification.ts — Resend Email Notification Sender
 *
 * A single utility that reads a notification markdown file from
 * notifications/outbox/ and sends it via the Resend API.
 *
 * Usage (Node.js):
 *   npx ts-node sage-mentor/send-notification.ts notifications/outbox/filename.md
 *
 * Or programmatically:
 *   import { sendNotification } from './send-notification'
 *   await sendNotification('notifications/outbox/filename.md', config)
 *
 * After sending, the file is moved to notifications/sent/ and
 * the sent_at frontmatter field is updated.
 *
 * Requirements:
 *   - Resend API key (RESEND_API_KEY env var or config)
 *   - Verified sender domain on Resend
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-003, CR-005]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance]
 * deprecation_flag: false
 */

import { parseFrontmatter, serialiseFrontmatter } from './support-agent'

// ============================================================================
// TYPES
// ============================================================================

/** Configuration for the Resend sender */
export type ResendConfig = {
  /** Resend API key */
  readonly api_key: string
  /** Verified sender email address */
  readonly from_email: string
  /** Sender display name */
  readonly from_name: string
  /** Reply-to address (defaults to from_email) */
  readonly reply_to?: string
}

/** Default sender configuration (uses env vars) */
export const DEFAULT_RESEND_CONFIG: Omit<ResendConfig, 'api_key'> = {
  from_email: 'support@sagereasoning.com',
  from_name: 'SageReasoning',
  reply_to: 'support@sagereasoning.com',
}

/** Parsed notification file */
export type NotificationFile = {
  readonly id: string
  readonly type: string
  readonly recipient: string
  readonly subject: string
  readonly status: string
  readonly body: string
  readonly created: string
  readonly sent_at: string | null
}

/** Result of a send operation */
export type SendResult = {
  readonly success: boolean
  readonly message_id: string | null
  readonly error: string | null
  readonly sent_at: string
}

// ============================================================================
// NOTIFICATION PARSING
// ============================================================================

/**
 * Parse a notification markdown file.
 */
export function parseNotificationFile(content: string): NotificationFile | null {
  const { frontmatter: fm, body } = parseFrontmatter(content)

  if (!fm.id || !fm.recipient || !fm.subject) return null

  // Extract email body section
  const bodyMatch = body.match(/## Email Body\s*\n([\s\S]*?)(?=\n## |\n$)/)
  const emailBody = bodyMatch ? bodyMatch[1].trim() : body.trim()

  return {
    id: String(fm.id),
    type: String(fm.type || 'general'),
    recipient: String(fm.recipient),
    subject: String(fm.subject),
    status: String(fm.status || 'draft'),
    body: emailBody,
    created: String(fm.created || ''),
    sent_at: fm.sent_at ? String(fm.sent_at) : null,
  }
}

// ============================================================================
// SEND VIA RESEND
// ============================================================================

/**
 * Send a notification email via the Resend API.
 *
 * Resend API: POST https://api.resend.com/emails
 */
export async function sendViaResend(
  notification: NotificationFile,
  config: ResendConfig
): Promise<SendResult> {
  const now = new Date().toISOString()

  // Pre-send validation
  if (!notification.recipient || !notification.recipient.includes('@')) {
    return {
      success: false,
      message_id: null,
      error: `Invalid recipient email: ${notification.recipient}`,
      sent_at: '',
    }
  }

  if (!notification.body || notification.body.length < 10) {
    return {
      success: false,
      message_id: null,
      error: 'Email body is too short or empty',
      sent_at: '',
    }
  }

  if (notification.status !== 'draft') {
    return {
      success: false,
      message_id: null,
      error: `Cannot send notification with status "${notification.status}" — must be "draft"`,
      sent_at: '',
    }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`,
      },
      body: JSON.stringify({
        from: `${config.from_name} <${config.from_email}>`,
        to: [notification.recipient],
        subject: notification.subject,
        text: notification.body,
        reply_to: config.reply_to || config.from_email,
        tags: [
          { name: 'notification_id', value: notification.id },
          { name: 'notification_type', value: notification.type },
        ],
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      return {
        success: false,
        message_id: null,
        error: `Resend API error (${response.status}): ${errBody}`,
        sent_at: '',
      }
    }

    const data = await response.json() as { id: string }

    return {
      success: true,
      message_id: data.id,
      error: null,
      sent_at: now,
    }
  } catch (err) {
    return {
      success: false,
      message_id: null,
      error: `Failed to send: ${err instanceof Error ? err.message : String(err)}`,
      sent_at: '',
    }
  }
}

// ============================================================================
// FULL SEND PIPELINE
// ============================================================================

/**
 * Full send pipeline: parse file, send via Resend, update file.
 *
 * Returns the updated file content (with sent_at populated)
 * and the send result. The caller handles file I/O (read/write/move).
 */
export async function sendNotification(
  fileContent: string,
  config: ResendConfig
): Promise<{
  result: SendResult
  updatedContent: string
}> {
  // 1. Parse the notification file
  const notification = parseNotificationFile(fileContent)
  if (!notification) {
    return {
      result: {
        success: false,
        message_id: null,
        error: 'Failed to parse notification file — missing required frontmatter fields (id, recipient, subject)',
        sent_at: '',
      },
      updatedContent: fileContent,
    }
  }

  // 2. Check if already sent
  if (notification.sent_at) {
    return {
      result: {
        success: false,
        message_id: null,
        error: `Notification already sent at ${notification.sent_at}`,
        sent_at: '',
      },
      updatedContent: fileContent,
    }
  }

  // 3. Send via Resend
  const result = await sendViaResend(notification, config)

  // 4. Update the file content with sent_at
  let updatedContent = fileContent
  if (result.success) {
    const { frontmatter, body } = parseFrontmatter(fileContent)
    frontmatter.status = 'sent'
    frontmatter.sent_at = result.sent_at
    updatedContent = `---\n${serialiseFrontmatter(frontmatter)}\n---\n${body}`
  }

  return { result, updatedContent }
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

/**
 * CLI usage: npx ts-node sage-mentor/send-notification.ts <filepath>
 *
 * Reads the notification file, sends via Resend, updates the file,
 * and moves it to notifications/sent/.
 *
 * Requires RESEND_API_KEY environment variable.
 */
export async function cli(args: string[]): Promise<void> {
  const filePath = args[0]
  if (!filePath) {
    console.error('Usage: npx ts-node sage-mentor/send-notification.ts <filepath>')
    console.error('Example: npx ts-node sage-mentor/send-notification.ts notifications/outbox/my-notification.md')
    process.exit(1)
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Error: RESEND_API_KEY environment variable is required')
    process.exit(1)
  }

  // Dynamic import for Node.js fs (not available in browser)
  const fs = await import('fs')
  const path = await import('path')

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`)
    process.exit(1)
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')

  const config: ResendConfig = {
    api_key: apiKey,
    ...DEFAULT_RESEND_CONFIG,
  }

  console.log(`Sending notification from: ${filePath}`)

  const { result, updatedContent } = await sendNotification(fileContent, config)

  if (result.success) {
    // Update the file
    fs.writeFileSync(filePath, updatedContent)

    // Move to sent/
    const sentPath = filePath.replace('/outbox/', '/sent/')
    const sentDir = path.dirname(sentPath)

    if (!fs.existsSync(sentDir)) {
      fs.mkdirSync(sentDir, { recursive: true })
    }

    fs.renameSync(filePath, sentPath)

    console.log(`Sent successfully! Message ID: ${result.message_id}`)
    console.log(`Moved to: ${sentPath}`)
  } else {
    console.error(`Send failed: ${result.error}`)
    process.exit(1)
  }
}

// Run CLI if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  cli(process.argv.slice(2))
}
