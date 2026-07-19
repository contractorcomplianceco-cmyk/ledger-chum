/**
 * Demo-mode email simulator. Produces deterministic sample data and fake
 * send/fetch results with NO network access, so the client-facing showcase
 * behaves end-to-end without real credentials. Selected via `pickByMode`.
 */
import type {
  EmailSettingsPublic,
  InboxMessageDetail,
  InboxMessageSummary,
  SendEmailInput,
  SendEmailResult,
} from "./types";

export const DEMO_EMAIL_SETTINGS: EmailSettingsPublic = {
  provider: "zoho",
  smtpEnabled: true,
  smtpHost: "smtp.zoho.com",
  smtpPort: 465,
  smtpSecure: true,
  smtpUsername: "billing@sample-marine.example",
  fromName: "Sample Marine Services",
  fromAddress: "billing@sample-marine.example",
  hasSmtpPassword: true,
  inboundEnabled: true,
  inboundProtocol: "imap",
  inboundHost: "imap.zoho.com",
  inboundPort: 993,
  inboundSecure: true,
  inboundUsername: "billing@sample-marine.example",
  hasInboundPassword: true,
  updatedAt: "2026-07-01T09:00:00.000Z",
};

function normalizeTo(to: SendEmailInput["to"]): string[] {
  return Array.isArray(to) ? to : [to];
}

/** Simulates an SMTP send without touching the network. */
export function simulateSend(input: SendEmailInput): SendEmailResult {
  const accepted = [...normalizeTo(input.to), ...(input.cc ?? []), ...(input.bcc ?? [])];
  return {
    messageId: `<demo-${Date.now()}-${Math.random().toString(16).slice(2)}@ledgeros.local>`,
    accepted,
    rejected: [],
    simulated: true,
  };
}

const DEMO_INBOX: InboxMessageDetail[] = [
  {
    uid: "1024",
    from: "ap@blueharbor.example",
    to: "billing@sample-marine.example",
    subject: "Re: Invoice INV-1001 — remittance advice",
    date: "2026-07-18T14:32:00.000Z",
    seen: false,
    hasAttachments: true,
    snippet: "Thanks — payment for INV-1001 has been scheduled via ACH for Friday…",
    text: "Thanks — payment for INV-1001 has been scheduled via ACH for Friday. Remittance advice attached.\n\n— Accounts Payable, Blue Harbor Yachts",
    html: null,
    attachments: [
      { filename: "remittance-INV-1001.pdf", contentType: "application/pdf", size: 18234 },
    ],
  },
  {
    uid: "1023",
    from: "billing@coastline.example",
    to: "billing@sample-marine.example",
    subject: "Question about hull cleaning line item",
    date: "2026-07-17T10:05:00.000Z",
    seen: true,
    hasAttachments: false,
    snippet: "Could you clarify the prop-shaft coupling charge on INV-1002?",
    text: "Could you clarify the prop-shaft coupling charge on INV-1002? We want to confirm before releasing payment.",
    html: null,
    attachments: [],
  },
  {
    uid: "1022",
    from: "no-reply@zoho.example",
    to: "billing@sample-marine.example",
    subject: "Your mailbox is 42% full",
    date: "2026-07-15T02:00:00.000Z",
    seen: true,
    hasAttachments: false,
    snippet: "This is an automated notice about your mailbox usage…",
    text: "This is an automated notice about your mailbox usage. No action is required.",
    html: null,
    attachments: [],
  },
];

export function simulateListInbox(limit = 25): InboxMessageSummary[] {
  return DEMO_INBOX.slice(0, limit).map(
    ({ text: _t, html: _h, to: _to, attachments: _a, ...s }) => s,
  );
}

export function simulateFetchMessage(uid: string): InboxMessageDetail | null {
  return DEMO_INBOX.find((m) => m.uid === uid) ?? null;
}
