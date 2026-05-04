import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Zap, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { AppFooter } from "@/components/AppFooter";

export default function Auth() {
  const nav = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) nav("/", { replace: true });
  }, [session, nav]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (err) throw err;
        toast({ title: "Welcome!", description: "Account created." });
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setError(result.error.message || "Google sign-in failed");
  };

  return (
    <div className="min-h-screen bg-background grid place-items-center px-4 py-10">
      <div className="fixed inset-0 bg-[linear-gradient(hsl(var(--muted)/0.5)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.5)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="relative w-full max-w-md animate-fade-in-up flex flex-col">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-primary-sm mb-3">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gradient">Agent 00Seo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-lg space-y-4">
          <Button type="button" variant="outline" onClick={handleGoogle} className="w-full h-11 gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.99 10.99 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">or</p>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Display name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Alex" className="pl-9" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" />
              </div>
            </div>
            {error && <ErrorAlert message={error} />}
            <Button type="submit" disabled={loading} className="w-full h-11 gap-2 glow-primary font-semibold">
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            {mode === "signin" ? "Don't have an account?" : "Already have one?"}{" "}
            <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }} className="text-primary hover:underline font-medium">
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
        <AppFooter />
      </div>
    </div>
  );
}
