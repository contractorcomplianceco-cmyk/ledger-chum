import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — LedgerOS" },
      { name: "description", content: "Sign in or create an account to explore LedgerOS with sample data." },
    ],
  }),
  component: AuthPage,
});

async function seedSampleWorkspace() {
  const { error } = await supabase.rpc("ensure_sample_demo_membership");
  if (error) throw new Error(error.message);
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        // With auto-confirm on, a session is issued immediately.
        const { data: sess } = await supabase.auth.getSession();
        if (!sess.session) {
          // Fall back to explicit sign-in.
          const { error: sErr } = await supabase.auth.signInWithPassword({ email, password });
          if (sErr) throw sErr;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      await seedSampleWorkspace();
      toast.success("Welcome — sample workspace loaded");
      navigate({ to: "/ledger/general" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Sign up and we'll load a sample company so you can explore right away."
              : "Sign in — we'll make sure your sample workspace is ready."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Sign up & explore" : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === "signup" ? (
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setMode("signin")}
            >
              Already have an account? Sign in
            </button>
          ) : (
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setMode("signup")}
            >
              New here? Create an account
            </button>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Back to home</Link>
        </div>
      </Card>
    </div>
  );
}
