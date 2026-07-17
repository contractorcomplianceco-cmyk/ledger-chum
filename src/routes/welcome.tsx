import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CreditCard,
  Database,
  FileText,
  Landmark,
  Layers,
  LineChart,
  Lock,
  PlayCircle,
  Plug,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEMO_URL, DEMO_IS_EXTERNAL } from "@/config/marketing";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "LedgerOS — Financial Operating System for Contractor Compliance" },
      {
        name: "description",
        content:
          "LedgerOS turns every operational event into a balanced, immutable double-entry journal — with real-time reporting, clean period close, and compliance enforced in the database itself.",
      },
      { property: "og:title", content: "LedgerOS — Financial Operating System" },
      {
        property: "og:description",
        content:
          "Modern double-entry accounting and financial operations for contractor compliance businesses.",
      },
      { property: "og:image", content: "/ledgeros-logo.png" },
      { name: "twitter:image", content: "/ledgeros-logo.png" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  component: MarketingPage,
});

/* ------------------------------------------------------------------ */
/* Launch Demo CTA — routes internally or externally from one constant */
/* ------------------------------------------------------------------ */

function LaunchDemoButton({
  size = "lg",
  variant = "default",
  className,
  children = "Launch Demo",
}: {
  size?: "lg" | "default";
  variant?: "default" | "outline" | "secondary";
  className?: string;
  children?: ReactNode;
}) {
  const content = (
    <>
      <PlayCircle aria-hidden="true" />
      {children}
    </>
  );

  // The default CTA gets the brand gradient + glow; other variants pass through.
  const brandClass =
    variant === "default"
      ? cx(
          "border-0 bg-gradient-brand-full text-white shadow-glow transition-transform",
          "hover:opacity-95 hover:brightness-110 hover:-translate-y-0.5",
          className,
        )
      : className;

  if (DEMO_IS_EXTERNAL) {
    return (
      <Button asChild size={size} variant={variant} className={brandClass}>
        <a href={DEMO_URL} rel="noopener noreferrer">
          {content}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild size={size} variant={variant} className={brandClass}>
      <Link to={DEMO_URL}>{content}</Link>
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal — subtle entrance animation, respects prefers-reduced-motion */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cx(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* Wordmark — white "Ledger" + gradient "OS", matching the logo. */
function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx("font-bold tracking-tight", className)}>
      Ledger
      <span className="bg-gradient-brand-full bg-clip-text text-transparent">OS</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: BookOpenCheck,
    title: "Double-entry general ledger",
    body: "Every posting is balanced debits-to-credits and immutable once posted, enforced by database triggers — not application code.",
  },
  {
    icon: FileText,
    title: "Invoices & accounts receivable",
    body: "Draft, send, and post invoices to per-line revenue accounts, with recurring billing, credit notes, and AR aging.",
  },
  {
    icon: CreditCard,
    title: "Payments, credits & refunds",
    body: "Record payments atomically — applications, invoice balances, and the journal entry all move together, mapped by payment method.",
  },
  {
    icon: ReceiptText,
    title: "Bills & accounts payable",
    body: "Manage vendors, bills, and AP payments with aging visibility so nothing slips past its due date.",
  },
  {
    icon: Landmark,
    title: "Banking & reconciliation",
    body: "Import transactions, match them to the ledger, and reconcile accounts with a clear, auditable trail.",
  },
  {
    icon: Building2,
    title: "Fixed assets, tax & period close",
    body: "Track assets and tax positions, then close each fiscal period — postings outside an open period are rejected automatically.",
  },
  {
    icon: Sparkles,
    title: "Apex intelligence layer",
    body: "A dedicated insights workspace surfaces company health, cash signals, and opportunities on top of your live ledger.",
  },
  {
    icon: Plug,
    title: "ServiceConnect integration API",
    body: "A public integration surface lets your operational systems push financial events straight into balanced, posted journals.",
  },
];

const TRUST = [
  "Double-entry integrity enforced at the database layer",
  "Row-level security on every table",
  "Built for multi-entity contractor operations",
  "Immutable, audited postings",
];

const STEPS = [
  {
    icon: Plug,
    title: "Connect your operations",
    body: "Wire your existing systems to LedgerOS through the ServiceConnect integration API, or work directly in the app.",
  },
  {
    icon: Layers,
    title: "Automated double-entry posting",
    body: "Financial events become balanced, immutable journal entries the moment they arrive — no manual bookkeeping.",
  },
  {
    icon: LineChart,
    title: "Real-time reporting & close",
    body: "See company health live, then close each period with confidence backed by a complete audit trail.",
  },
];

const SECURITY = [
  {
    icon: ShieldCheck,
    title: "Row-level security everywhere",
    body: "Access control is enforced on every table, so tenants only ever see their own data.",
  },
  {
    icon: Building2,
    title: "Strict tenant isolation",
    body: "Multi-entity contractor operations are partitioned by organization from the ground up.",
  },
  {
    icon: Lock,
    title: "Immutable audit trail",
    body: "Posted entries can only be voided, never edited or deleted — every change is correlated to an audit event.",
  },
  {
    icon: Database,
    title: "Atomic posting & exact money",
    body: "Postings commit as one balanced transaction, and all money is stored as exact NUMERIC — never floating point.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function MarketingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Security />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/80 text-navy-foreground backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6"
      >
        <Link to="/welcome" className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-navy">
          <img
            src="/ledgeros-emblem.png"
            alt="LedgerOS"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 drop-shadow-[0_0_12px_oklch(0.58_0.2_258/0.45)]"
          />
          <Wordmark className="text-lg" />
        </Link>
        <div className="flex items-center gap-3">
          <a
            href="#features"
            className="hidden text-sm text-navy-foreground/70 transition-colors hover:text-navy-foreground sm:inline"
          >
            Features
          </a>
          <a
            href="#security"
            className="hidden text-sm text-navy-foreground/70 transition-colors hover:text-navy-foreground sm:inline"
          >
            Security
          </a>
          <LaunchDemoButton size="default" />
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-navy text-navy-foreground">
      {/* decorative gradient wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-gradient-brand-full opacity-20 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
        <div>
          <Reveal>
            <div className="flex items-center gap-3">
              <img
                src="/ledgeros-emblem.png"
                alt="LedgerOS"
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 drop-shadow-[0_0_28px_oklch(0.58_0.2_258/0.55)]"
              />
              <Wordmark className="text-2xl" />
            </div>
          </Reveal>
          <Reveal delay={40}>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-navy-foreground/80">
              <Sparkles className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />
              The financial operating system for contractor compliance
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Accounting infrastructure built for{" "}
              <span className="bg-gradient-brand-full bg-clip-text text-transparent">
                contractor operations
              </span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-navy-foreground/70">
              LedgerOS is a modern double-entry accounting and financial operations platform.
              Turn every operational event into a balanced, immutable journal entry — with
              real-time reporting, clean period close, and compliance built into the database
              itself.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <LaunchDemoButton size="lg" />
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-transparent text-navy-foreground hover:bg-white/10 hover:text-navy-foreground">
                <a href="#how-it-works">
                  See how it works
                  <ArrowRight aria-hidden="true" />
                </a>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-6 text-sm text-navy-foreground/50">
              Double-entry integrity · Row-level security · Immutable audit trail
            </p>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}

/* Pure-CSS dashboard-style motif — no external image assets required. */
function HeroVisual() {
  return (
    <div className="relative" aria-hidden="true">
      <div className="absolute inset-0 -m-6 rounded-3xl bg-gradient-brand-full opacity-25 blur-2xl" />
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-navy-foreground/80">
            <img src="/ledgeros-emblem.png" alt="" aria-hidden="true" className="h-6 w-6" />
            Trial Balance
          </div>
          <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
            Balanced
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Assets", value: "1,284,900" },
            { label: "Liabilities", value: "612,340" },
            { label: "Equity", value: "672,560" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="text-[11px] uppercase tracking-wide text-navy-foreground/50">
                {s.label}
              </div>
              <div className="mt-1 font-mono text-sm text-navy-foreground">${s.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {[
            { acct: "1010 · Bank Operating", dr: "48,200.00", cr: "" },
            { acct: "1200 · Accounts Receivable", dr: "", cr: "48,200.00" },
            { acct: "4000 · Service Revenue", dr: "", cr: "31,050.00" },
            { acct: "2100 · Accounts Payable", dr: "12,900.00", cr: "" },
          ].map((row) => (
            <div
              key={row.acct}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs"
            >
              <span className="truncate text-navy-foreground/75">{row.acct}</span>
              <span className="w-20 text-right font-mono text-navy-foreground/90">
                {row.dr && `$${row.dr}`}
              </span>
              <span className="w-20 text-right font-mono text-navy-foreground/60">
                {row.cr && `$${row.cr}`}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-end gap-1.5" aria-hidden="true">
          {[38, 52, 44, 66, 58, 78, 71, 88].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-brand-full"
              style={{ height: `${h}px`, opacity: 0.35 + i * 0.08 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrustBar() {
  return (
    <section aria-label="Product principles" className="border-b border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <ul className="grid gap-4 text-sm font-medium text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item, i) => (
            <Reveal as="li" key={item} delay={i * 60} className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <span>{item}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <span className="text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      </Reveal>
      <Reveal delay={160}>
        <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
      </Reveal>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          eyebrow="Platform"
          title="One ledger for the whole financial operation"
          subtitle="From the first invoice to period close, LedgerOS covers the full accounting lifecycle for contractor compliance businesses."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 80}>
              <Card className="group h-full border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-brand-full text-white shadow-glow">
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          eyebrow="How it works"
          title="From operational event to trusted books"
          subtitle="Three steps take you from your existing systems to a clean, closable set of books."
        />
        <ol className="mt-16 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 100}>
              <div className="relative h-full rounded-xl border border-border bg-card p-8">
                <span className="absolute -top-4 left-8 grid h-8 w-8 place-items-center rounded-full bg-gradient-brand-full text-sm font-bold text-white shadow-glow">
                  {i + 1}
                </span>
                <s.icon className="h-6 w-6 text-brand" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Security() {
  return (
    <section id="security" className="scroll-mt-20 relative overflow-hidden bg-gradient-navy text-navy-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-60"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-cyan">
              Security & compliance
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Compliance enforced by the architecture
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 text-lg text-navy-foreground/70">
              Controls a compliance-conscious buyer cares about aren't bolted on — they're
              structural guarantees of the platform.
            </p>
          </Reveal>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {SECURITY.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 90}>
              <div className="flex h-full gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white/10">
                  <s.icon className="h-5 w-5 text-brand-cyan" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-foreground/70">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-navy px-8 py-16 text-center text-navy-foreground shadow-lifted sm:px-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-70"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                See LedgerOS run on real double-entry
              </h2>
              <p className="mt-4 text-lg text-navy-foreground/70">
                Take a self-guided walkthrough of the platform — invoices, payments, banking, and
                the Apex intelligence layer, all backed by a live ledger.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <LaunchDemoButton size="lg" />
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-transparent text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
                >
                  <a href="#features">Explore the platform</a>
                </Button>
              </div>
              <p className="mt-6 text-sm text-navy-foreground/50">
                Prefer a guided tour? We'll walk your team through it end to end.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 bg-navy text-navy-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="max-w-sm">
          <img
            src="/ledgeros-logo.png"
            alt="LedgerOS"
            width={320}
            height={88}
            className="h-12 w-auto"
          />
          <p className="sr-only">LedgerOS</p>
          <p className="mt-3 text-sm text-navy-foreground/70">
            Double-entry accounting and financial operations for the Contractors Compliance
            Authority.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Security", href: "#security" },
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Contact", href: "#" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-navy-foreground/70 transition-colors hover:text-navy-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-navy-foreground/60 sm:flex-row">
          <p>© {year} Contractors Compliance Authority. All rights reserved.</p>
          <p>LedgerOS — Financial Operating System</p>
        </div>
      </div>
    </footer>
  );
}
