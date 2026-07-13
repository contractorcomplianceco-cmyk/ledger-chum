import { createFileRoute } from "@tanstack/react-router";
import { ApexPage, ApexSection } from "@/components/apex/apex-page";
import { Card } from "@/components/ui/card";

const ROLES = [
  { role: "Rose / Owner", surfaces: "Company Health · available cash · priorities · risks · opportunities · approvals · profitability · hiring · expansion · owner and investor decisions" },
  { role: "Christin / Accounting Lead", surfaces: "Close readiness · banking exceptions · expense approvals · payroll reconciliation · compensation verification · cash reserves · data quality · tax review items" },
  { role: "Accounting / Tax Advisor", surfaces: "Tax and accountant review items only" },
  { role: "Sales Leadership", surfaces: "Collections · revenue · customer profitability · commission progress · attribution · pricing opportunities · renewals · expansions" },
  { role: "Marketing", surfaces: "Campaign contribution profit · attribution · marketing ROI" },
  { role: "Operations", surfaces: "Exceptions · bills · expenses · client recovery · vendor activity · process risks · action plans" },
  { role: "Systems Reviewer", surfaces: "Data quality · integration health · governance" },
  { role: "Team Member", surfaces: "My expenses · reimbursements · compensation statement · travel · education budget · tasks · approvals — no companywide sensitive data" },
];

export const Route = createFileRoute("/apex/roles")({
  head: () => ({ meta: [{ title: "Role Workspaces — Project APEX" }] }),
  component: () => (
    <ApexPage
      title="Role-Specific Workspaces"
      description="Every workspace composes a role view. Sensitive companywide values are masked for Team Member; advisor roles see only their permitted subset."
    >
      <ApexSection title="Role experience matrix">
        <div className="grid gap-3 md:grid-cols-2">
          {ROLES.map((r) => (
            <Card key={r.role} className="border-border/70 p-3">
              <div className="text-[13px] font-semibold">{r.role}</div>
              <div className="mt-1 text-[12px] text-muted-foreground">{r.surfaces}</div>
            </Card>
          ))}
        </div>
      </ApexSection>
    </ApexPage>
  ),
});
