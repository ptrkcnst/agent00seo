import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, History, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Profile { display_name: string | null; avatar_url: string | null; }

export function UserMenu() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, avatar_url").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile(data);
    });
  }, [user]);

  if (!user) {
    return (
      <Button size="sm" onClick={() => nav("/auth")} className="gap-1.5 glow-primary-sm">
        Sign in
      </Button>
    );
  }

  const name = profile?.display_name || user.email?.split("@")[0] || "User";
  const initial = name.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1 hover:bg-muted/50 transition-colors">
          <Avatar className="h-7 w-7">
            <AvatarImage src={profile?.avatar_url || undefined} alt={name} />
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">{initial}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-foreground hidden sm:inline max-w-[120px] truncate">{name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="text-xs text-muted-foreground">Signed in as</div>
          <div className="text-sm font-medium truncate">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => nav("/history")}>
          <History className="mr-2 h-4 w-4" /> Audit history
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => nav("/profile")}>
          <UserIcon className="mr-2 h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut().then(() => nav("/auth"))}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
