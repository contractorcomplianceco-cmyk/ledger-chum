import { describe, it, expect } from "vitest";
import { emailSettingsInputSchema, sendEmailInputSchema } from "./types";
import {
  applyPreset,
  PROVIDER_PRESETS,
  smtpReadinessErrors,
  inboundReadinessErrors,
  maskSecret,
} from "./config";
import { simulateSend, simulateListInbox, simulateFetchMessage, DEMO_EMAIL_SETTINGS } from "./demo";

describe("email config validation", () => {
  it("accepts a well-formed send payload with a single recipient", () => {
    const parsed = sendEmailInputSchema.parse({
      to: "a@b.com",
      subject: "Hello",
      text: "Body",
    });
    expect(parsed.to).toBe("a@b.com");
  });

  it("accepts multiple recipients, cc/bcc, and attachments", () => {
    const parsed = sendEmailInputSchema.parse({
      to: ["a@b.com", "c@d.com"],
      cc: ["e@f.com"],
      bcc: ["g@h.com"],
      subject: "Invoice",
      html: "<p>hi</p>",
      attachments: [{ filename: "inv.pdf", contentBase64: "AAAA", contentType: "application/pdf" }],
    });
    expect(parsed.attachments).toHaveLength(1);
  });

  it("rejects a payload with neither html nor text body", () => {
    expect(() => sendEmailInputSchema.parse({ to: "a@b.com", subject: "x" })).toThrow();
  });

  it("rejects an invalid recipient address", () => {
    expect(() =>
      sendEmailInputSchema.parse({ to: "not-an-email", subject: "x", text: "y" }),
    ).toThrow();
  });

  it("rejects an out-of-range SMTP port", () => {
    expect(() => emailSettingsInputSchema.parse({ smtpPort: 99999 })).toThrow();
  });

  it("applies schema defaults for an empty settings object", () => {
    const parsed = emailSettingsInputSchema.parse({});
    expect(parsed.provider).toBe("custom");
    expect(parsed.smtpPort).toBe(587);
    expect(parsed.inboundProtocol).toBe("imap");
    expect(parsed.inboundSecure).toBe(true);
  });
});

describe("provider presets", () => {
  it("applies Zoho host/port/TLS over the current form", () => {
    const base = emailSettingsInputSchema.parse({});
    const next = applyPreset("zoho", base);
    expect(next.smtpHost).toBe(PROVIDER_PRESETS.zoho.smtpHost);
    expect(next.smtpPort).toBe(465);
    expect(next.smtpSecure).toBe(true);
    expect(next.inboundHost).toBe("imap.zoho.com");
  });

  it("keeps a user-entered host when preset host is blank (custom)", () => {
    const base = { ...emailSettingsInputSchema.parse({}), smtpHost: "mail.acme.internal" };
    const next = applyPreset("custom", base);
    expect(next.smtpHost).toBe("mail.acme.internal");
  });
});

describe("readiness checks", () => {
  it("reports no errors when SMTP is disabled", () => {
    expect(
      smtpReadinessErrors({
        smtpEnabled: false,
        smtpHost: "",
        smtpUsername: "",
        fromAddress: "",
        hasSmtpPassword: false,
      }),
    ).toEqual([]);
  });

  it("lists every missing SMTP field when enabled", () => {
    const errs = smtpReadinessErrors({
      smtpEnabled: true,
      smtpHost: "",
      smtpUsername: "",
      fromAddress: "",
      hasSmtpPassword: false,
    });
    expect(errs.length).toBe(4);
  });

  it("flags a missing inbound password", () => {
    const errs = inboundReadinessErrors({
      inboundEnabled: true,
      inboundHost: "h",
      inboundUsername: "u",
      hasInboundPassword: false,
    });
    expect(errs).toContain("Inbound password is required");
  });

  it("masks secrets without revealing them", () => {
    expect(maskSecret(true)).toBe("••••••••");
    expect(maskSecret(false)).toBe("");
  });
});

describe("demo-mode simulation (no network)", () => {
  it("simulateSend echoes recipients and marks the result simulated", () => {
    const res = simulateSend({ to: ["a@b.com"], cc: ["c@d.com"], subject: "s", text: "t" });
    expect(res.simulated).toBe(true);
    expect(res.accepted).toContain("a@b.com");
    expect(res.accepted).toContain("c@d.com");
    expect(res.rejected).toEqual([]);
    expect(res.messageId).toMatch(/@ledgeros\.local>$/);
  });

  it("simulateListInbox returns bounded summaries without body fields", () => {
    const list = simulateListInbox(2);
    expect(list.length).toBe(2);
    expect(list[0]).not.toHaveProperty("text");
    expect(list[0]).toHaveProperty("subject");
  });

  it("simulateFetchMessage returns a full message by uid, or null", () => {
    const msg = simulateFetchMessage("1024");
    expect(msg?.uid).toBe("1024");
    expect(msg?.attachments.length).toBeGreaterThan(0);
    expect(simulateFetchMessage("does-not-exist")).toBeNull();
  });

  it("exposes demo settings with password flags but no raw passwords", () => {
    expect(DEMO_EMAIL_SETTINGS.hasSmtpPassword).toBe(true);
    expect(DEMO_EMAIL_SETTINGS).not.toHaveProperty("smtpPassword");
  });
});
