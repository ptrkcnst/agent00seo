import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, avatar_url").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      setDisplayName(data?.display_name || "");
      setAvatarUrl(data?.avatar_url || "");
      setLoading(false);
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert(
      { user_id: user.id, display_name: displayName || null, avatar_url: avatarUrl || null },
      { onConflict: "user_id" }
    );
    setSaving(false);
    if (error) toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated" });
  };

  const initial = (displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-[linear-gradient(hsl(var(--muted)/0.5)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.5)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="relative mx-auto max-w-2xl px-4 py-10">
        <AppHeader />
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-5 animate-fade-in-up">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Your profile</h2>
            <p className="text-xs text-muted-foreground">Shown across the app and on shared reports.</p>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/15 text-primary text-xl font-semibold">{initial}</AvatarFallback>
                </Avatar>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input id="avatar" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
              </div>
              <Button onClick={save} disabled={saving} className="glow-primary-sm">
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </>
          )}
        </div>
        <AppFooter />
      </div>
    </div>
  );
}
