import { cn } from "@/lib/utils";
import { currencyPrecise } from "@/lib/mock/finance";
import type { InvoiceDocumentData, InvoiceParty } from "@/lib/invoicing/invoice-document";
import {
  CLASSIC_THEME,
  styleDataAttrs,
  styleToCssVars,
  type InvoiceStyle,
} from "@/lib/invoicing/invoice-theme";

/**
 * A real, client-facing invoice document — not a data table. Renders brand header,
 * bill-to / bill-from, invoice meta, line items, totals, notes, and a Pay-now CTA
 * placeholder (Phase C wires it).
 *
 * Content comes from `data` (client-only figures — see `InvoiceDocumentData`) and
 * every presentation decision comes from `style`. Visual tokens are surfaced as
 * `--inv-*` CSS variables; structural choices (header layout, table style, density,
 * logo placement) are surfaced as `data-*` attributes the component/CSS branch on.
 * The two are independent by construction, which is what Phase B (AI styling) plugs
 * into: generate a new `InvoiceStyle`, pass it here, numbers are untouched.
 *
 * The root carries `.invoice-print-region` so the print stylesheet can isolate it
 * for PDF export / browser print.
 */
export function InvoiceDocument({
  data,
  style = CLASSIC_THEME,
  className,
}: {
  data: InvoiceDocumentData;
  style?: InvoiceStyle;
  className?: string;
}) {
  const { totals } = data;
  const { headerLayout, logoPlacement } = style.layout;
  const showLogo = logoPlacement !== "none";

  return (
    <div
      className={cn("invoice-print-region invoice-document", className)}
      style={styleToCssVars(style)}
      data-testid="invoice-document"
      {...styleDataAttrs(style)}
    >
      <div className="invoice-document__page">
        <header
          className={cn(
            "invoice-document__header",
            headerLayout === "centered" && "invoice-document__header--centered",
            headerLayout === "banner" && "invoice-document__header--banner",
            headerLayout === "sidebar" && "invoice-document__header--sidebar",
            logoPlacement === "right" && "invoice-document__header--reverse",
          )}
        >
          <div
            className={cn(
              "invoice-document__brand",
              logoPlacement === "center" && "invoice-document__brand--center",
            )}
          >
            {showLogo && (
              <div className="invoice-document__logo" aria-hidden="true">
                {initials(data.billFrom.name)}
              </div>
            )}
            <PartyBlock party={data.billFrom} emphasizeName />
          </div>
          <div className="invoice-document__title">
            <div className="invoice-document__title-word">Invoice</div>
            <div className="invoice-document__number">{data.number}</div>
            {data.status && (
              <div className="invoice-document__status">{humanizeStatus(data.status)}</div>
            )}
          </div>
        </header>

        <section className="invoice-document__meta">
          <MetaItem label="Issue date" value={data.issueDate} />
          <MetaItem label="Due date" value={data.dueDate} />
          {data.terms && <MetaItem label="Terms" value={data.terms} />}
          {data.poNumber && <MetaItem label="PO number" value={data.poNumber} />}
        </section>

        <section className="invoice-document__parties">
          <div className="invoice-document__party-col">
            <div className="invoice-document__party-label">Bill to</div>
            <PartyBlock party={data.billTo} emphasizeName />
          </div>
        </section>

        <table className="invoice-document__table">
          <thead>
            <tr>
              <th className="invoice-document__th invoice-document__th--desc">Description</th>
              <th className="invoice-document__th invoice-document__th--num">Qty</th>
              <th className="invoice-document__th invoice-document__th--num">Rate</th>
              <th className="invoice-document__th invoice-document__th--num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((l) => (
              <tr key={l.id} className="invoice-document__row">
                <td className="invoice-document__td">
                  <div className="invoice-document__line-desc">{l.description}</div>
                  {l.detail && <div className="invoice-document__line-detail">{l.detail}</div>}
                </td>
                <td className="invoice-document__td invoice-document__td--num">{l.quantity}</td>
                <td className="invoice-document__td invoice-document__td--num">
                  {currencyPrecise(l.rate)}
                </td>
                <td className="invoice-document__td invoice-document__td--num">
                  {currencyPrecise(l.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="invoice-document__totals">
          <dl className="invoice-document__totals-list">
            <TotalRow label="Subtotal" value={currencyPrecise(totals.subtotal)} />
            {totals.discount > 0 && (
              <TotalRow label="Discount" value={`−${currencyPrecise(totals.discount)}`} />
            )}
            {totals.tax > 0 && <TotalRow label="Tax" value={currencyPrecise(totals.tax)} />}
            <TotalRow label="Total" value={currencyPrecise(totals.total)} emphasize />
            {totals.amountPaid > 0 && (
              <TotalRow label="Amount paid" value={`−${currencyPrecise(totals.amountPaid)}`} />
            )}
            {totals.amountPaid > 0 && (
              <TotalRow label="Balance due" value={currencyPrecise(totals.balanceDue)} emphasize />
            )}
          </dl>
        </section>

        {data.notes && (
          <section className="invoice-document__notes">
            <div className="invoice-document__party-label">Notes</div>
            <p className="invoice-document__notes-body">{data.notes}</p>
          </section>
        )}

        {totals.balanceDue > 0 && (
          <section className="invoice-document__pay" data-print-hidden="true">
            <button
              type="button"
              className="invoice-document__pay-btn"
              disabled
              title="Online payments arrive in a later phase"
            >
              Pay {currencyPrecise(totals.balanceDue)} now
            </button>
            <span className="invoice-document__pay-hint">Secure online payment — coming soon</span>
          </section>
        )}

        {data.footer && <footer className="invoice-document__footer">{data.footer}</footer>}
      </div>
    </div>
  );
}

function PartyBlock({ party, emphasizeName }: { party: InvoiceParty; emphasizeName?: boolean }) {
  return (
    <div className="invoice-document__party">
      <div
        className={cn(
          "invoice-document__party-name",
          emphasizeName && "invoice-document__party-name--strong",
        )}
      >
        {party.name}
      </div>
      {party.lines.map((line, i) => (
        <div key={i} className="invoice-document__party-line">
          {line}
        </div>
      ))}
      {party.email && <div className="invoice-document__party-line">{party.email}</div>}
      {party.phone && <div className="invoice-document__party-line">{party.phone}</div>}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="invoice-document__meta-item">
      <div className="invoice-document__meta-label">{label}</div>
      <div className="invoice-document__meta-value">{value}</div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "invoice-document__total-row",
        emphasize && "invoice-document__total-row--emphasize",
      )}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function humanizeStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
