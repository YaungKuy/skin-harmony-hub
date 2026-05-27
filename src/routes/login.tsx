import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) || "/account" }),
});

function Login() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const { redirect } = Route.useSearch();

  const destinationFor = (r: string | null) =>
    r === "admin" ? "/admin" : redirect;
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && role) navigate({ to: destinationFor(role) });
  }, [user, role, loading, redirect, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-4xl">{mode === "signin" ? "Sign in" : "Create account"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signin" ? "Welcome back to Maren & Sage." : "Save your details and track orders."}
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-3">
        {mode === "signup" && (
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring" />
        )}
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring" />
        <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring" />
        <button disabled={busy} className="w-full rounded-full bg-primary py-3 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-foreground underline">
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">← Back home</Link>
      </p>
    </section>
  );
}
