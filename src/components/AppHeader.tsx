import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function AppHeader() {
  return (
    <header className="mb-8 flex items-center justify-between gap-3 animate-fade-in-up">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-primary-sm transition-transform group-hover:scale-105">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-gradient">Agent 00Seo</h1>
          <span className="text-xs text-muted-foreground hidden sm:inline">by Constantin Patrick</span>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
