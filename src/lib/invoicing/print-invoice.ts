import { paperPageSize, type PaperSize } from "./invoice-theme";

/**
 * Print (or "Save as PDF") a single invoice document element.
 *
 * We isolate the target with a print stylesheet (see `@media print` in styles.css)
 * rather than opening a new window, so the document keeps the app's fonts and the
 * theme's `--inv-*` variables — giving true page fidelity. The browser's print
 * dialog exposes "Save as PDF" on every platform, which is the download path.
 */
export function printInvoiceDocument(el: HTMLElement | null, paper: PaperSize = "letter") {
  if (!el || typeof window === "undefined") return;

  const PAGE_STYLE_ID = "invoice-print-page-style";
  const ACTIVE = "invoice-print-region--active";

  const pageStyle = document.createElement("style");
  pageStyle.id = PAGE_STYLE_ID;
  pageStyle.textContent = `@page { size: ${paperPageSize(paper)}; margin: 0.5in; }`;
  document.head.appendChild(pageStyle);

  el.classList.add(ACTIVE);
  document.body.classList.add("printing-invoice");

  const cleanup = () => {
    el.classList.remove(ACTIVE);
    document.body.classList.remove("printing-invoice");
    document.getElementById(PAGE_STYLE_ID)?.remove();
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);
  window.print();
  // Safari can skip `afterprint`; ensure state is restored regardless.
  window.setTimeout(cleanup, 1000);
}
