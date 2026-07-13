import { createFileRoute } from "@tanstack/react-router";
import { ExecutiveHome } from "@/components/apex/executive-home";

export const Route = createFileRoute("/apex/")({
  head: () => ({
    meta: [
      { title: "Executive Home — LedgerOS" },
      {
        name: "description",
        content:
          "APEX Executive Home Workspace — a financial operating system for growth companies. What requires your attention today?",
      },
    ],
  }),
  component: ExecutiveHome,
});
