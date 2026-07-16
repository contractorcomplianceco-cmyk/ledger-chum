import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { PERMISSIONS, type Role } from "@/lib/mock/implementation";

export const Route = createFileRoute("/implementation/permissions")({
  head: () => ({ meta: [{ title: "Permission Matrix — LedgerOS" }] }),
  component: Permissions,
});

const ROLES: Role[] = ["Rose", "Christin", "Carmen", "Accountant", "Team", "Integration"];

const ROLE_NOTE: Record<Role, string> = {
  Rose: "Owner. Final override on cash, guardrails, and pricing exceptions.",
  Christin: "Accounting Lead. Reclassifications, approvals, verification.",
  Carmen: "Systems Reviewer. Attestation and audit — never posts value.",
  Accountant: "Day-to-day ledger operator. Bounded approval limits.",
  Team: "Individual contributors. Submit and view own scope.",
  Integration: "Service accounts. Signed events only — no interactive login.",
};

function Permissions() {
  return (
    <ImplementationPage
      title="Permission Matrix"
      description="Six roles × every route group in the Phase 1–4 design. Actions authorized here map 1:1 to the backend permission strings on the API map."
    >
      <div className="grid gap-3 md:grid-cols-3">
        {ROLES.map((r) => (
          <Card key={r} className="border-border/70 p-3">
            <div className="text-[12.5px] font-semibold">{r}</div>
            <div className="mt-0.5 text-[11.5px] text-muted-foreground">{ROLE_NOTE[r]}</div>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/30 text-[10.5px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Route</th>
                {ROLES.map((r) => (
                  <th key={r} className="px-3 py-2 text-left font-semibold">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.route} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-[11.5px] text-muted-foreground">
                    {p.route}
                  </td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-3 py-2.5">
                      {p.matrix[r]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="border-border/70 p-4 text-[12px] text-muted-foreground">
        <div className="font-semibold text-foreground">Sensitive-value rules</div>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Bank balances masked for Team; visible to Rose, Christin, Accountant.</li>
          <li>Payroll amounts visible only to Rose, Christin, Accountant.</li>
          <li>Carmen may view and export everything but never post value.</li>
          <li>
            Integration service accounts may only post signed events — never authenticate
            interactively.
          </li>
          <li>
            Every deny returns an audit event; every override requires a justification string.
          </li>
        </ul>
      </Card>
    </ImplementationPage>
  );
}
