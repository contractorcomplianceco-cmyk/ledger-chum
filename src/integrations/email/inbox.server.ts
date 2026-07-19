// Server-only inbound mail: connect to a mailbox over IMAP (imapflow) or POP3
// (node-pop3), list recent messages, and parse a single message with
// mailparser. Provider-agnostic; all settings come from the resolved config.
// Load with `await import(...)` inside a server handler — never from client code.
import { ImapFlow } from "imapflow";
import Pop3 from "node-pop3";
import { simpleParser, type ParsedMail } from "mailparser";
import type { EmailConfigResolved, InboxMessageDetail, InboxMessageSummary } from "./types";

function addr(value: { text?: string } | undefined, fallback = ""): string {
  return value?.text ?? fallback;
}

function snippetOf(text: string, max = 140): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsedToDetail(uid: string, parsed: ParsedMail, seen: boolean): InboxMessageDetail {
  const html = typeof parsed.html === "string" ? parsed.html : null;
  const text = parsed.text ?? (html ? stripHtml(html) : "");
  const attachments = (parsed.attachments ?? []).map((a) => ({
    filename: a.filename ?? "attachment",
    contentType: a.contentType ?? "application/octet-stream",
    size: a.size ?? 0,
  }));
  return {
    uid,
    from: addr(parsed.from),
    to: addr(Array.isArray(parsed.to) ? parsed.to[0] : parsed.to),
    cc: addr(Array.isArray(parsed.cc) ? parsed.cc[0] : parsed.cc) || undefined,
    subject: parsed.subject ?? "(no subject)",
    date: (parsed.date ?? new Date()).toISOString(),
    seen,
    hasAttachments: attachments.length > 0,
    snippet: snippetOf(text),
    text,
    html,
    attachments,
  };
}

// --------------------------- IMAP (imapflow) ---------------------------------

function imapClient(cfg: EmailConfigResolved): ImapFlow {
  return new ImapFlow({
    host: cfg.inboundHost,
    port: cfg.inboundPort,
    secure: cfg.inboundSecure,
    auth: { user: cfg.inboundUsername, pass: cfg.inboundPassword },
    logger: false,
  });
}

async function listImap(
  cfg: EmailConfigResolved,
  mailbox: string,
  limit: number,
): Promise<InboxMessageSummary[]> {
  const client = imapClient(cfg);
  await client.connect();
  const out: InboxMessageSummary[] = [];
  const lock = await client.getMailboxLock(mailbox);
  try {
    const total = typeof client.mailbox === "object" ? client.mailbox.exists : 0;
    if (total > 0) {
      const start = Math.max(1, total - limit + 1);
      for await (const msg of client.fetch(`${start}:*`, {
        uid: true,
        envelope: true,
        flags: true,
        bodyStructure: true,
      })) {
        const flags = msg.flags ?? new Set<string>();
        out.push({
          uid: String(msg.uid),
          from: msg.envelope?.from?.[0]?.address ?? "",
          subject: msg.envelope?.subject ?? "(no subject)",
          date: (msg.envelope?.date ?? new Date()).toISOString(),
          seen: flags.has("\\Seen"),
          hasAttachments: hasImapAttachments(msg.bodyStructure),
          snippet: "",
        });
      }
    }
  } finally {
    lock.release();
  }
  await client.logout();
  return out.reverse();
}

function hasImapAttachments(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const n = node as { disposition?: string; childNodes?: unknown[] };
  if (n.disposition === "attachment") return true;
  return (n.childNodes ?? []).some((c) => hasImapAttachments(c));
}

async function fetchImap(
  cfg: EmailConfigResolved,
  mailbox: string,
  uid: string,
): Promise<InboxMessageDetail | null> {
  const client = imapClient(cfg);
  await client.connect();
  const lock = await client.getMailboxLock(mailbox);
  try {
    const msg = await client.fetchOne(uid, { uid: true, source: true, flags: true }, { uid: true });
    if (!msg || !msg.source) return null;
    const parsed = await simpleParser(msg.source);
    return parsedToDetail(uid, parsed, (msg.flags ?? new Set<string>()).has("\\Seen"));
  } finally {
    lock.release();
    await client.logout();
  }
}

// --------------------------- POP3 (node-pop3) --------------------------------

function pop3Client(cfg: EmailConfigResolved): Pop3 {
  return new Pop3({
    host: cfg.inboundHost,
    port: cfg.inboundPort,
    tls: cfg.inboundSecure,
    user: cfg.inboundUsername,
    password: cfg.inboundPassword,
  });
}

/** POP3 has no server-side flags/UIDs the way IMAP does — we use message numbers. */
async function listPop3(cfg: EmailConfigResolved, limit: number): Promise<InboxMessageSummary[]> {
  const pop = pop3Client(cfg);
  await pop.connect();
  try {
    const list = await pop.LIST();
    const nums = (Array.isArray(list) ? list : []).map(([n]) => Number(n)).filter(Number.isFinite);
    const recent = nums.slice(-limit).reverse();
    const out: InboxMessageSummary[] = [];
    for (const num of recent) {
      const raw = await pop.RETR(num);
      const parsed = await simpleParser(raw);
      out.push({
        uid: String(num),
        from: addr(parsed.from),
        subject: parsed.subject ?? "(no subject)",
        date: (parsed.date ?? new Date()).toISOString(),
        seen: true,
        hasAttachments: (parsed.attachments ?? []).length > 0,
        snippet: snippetOf(parsed.text ?? ""),
      });
    }
    return out;
  } finally {
    await pop.QUIT();
  }
}

async function fetchPop3(
  cfg: EmailConfigResolved,
  uid: string,
): Promise<InboxMessageDetail | null> {
  const pop = pop3Client(cfg);
  await pop.connect();
  try {
    const raw = await pop.RETR(Number(uid));
    const parsed = await simpleParser(raw);
    return parsedToDetail(uid, parsed, true);
  } finally {
    await pop.QUIT();
  }
}

// ------------------------------- Facade --------------------------------------

export async function verifyInbound(cfg: EmailConfigResolved): Promise<{ ok: true }> {
  if (!cfg.inboundHost) throw new Error("Inbound mail is not configured (missing host)");
  if (cfg.inboundProtocol === "pop3") {
    const pop = pop3Client(cfg);
    await pop.connect();
    await pop.QUIT();
  } else {
    const client = imapClient(cfg);
    await client.connect();
    await client.logout();
  }
  return { ok: true };
}

export async function listInbox(
  cfg: EmailConfigResolved,
  mailbox: string,
  limit: number,
): Promise<InboxMessageSummary[]> {
  return cfg.inboundProtocol === "pop3" ? listPop3(cfg, limit) : listImap(cfg, mailbox, limit);
}

export async function fetchInboxMessage(
  cfg: EmailConfigResolved,
  mailbox: string,
  uid: string,
): Promise<InboxMessageDetail | null> {
  return cfg.inboundProtocol === "pop3" ? fetchPop3(cfg, uid) : fetchImap(cfg, mailbox, uid);
}
