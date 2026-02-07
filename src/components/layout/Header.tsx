import { Bell, Search, Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileMenuTrigger } from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useCreditBalance } from "@/hooks/useReferrals";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { data: creditBalance = 0 } = useCreditBalance();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    if (profile?.email) {
      return profile.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="mx-4 mt-4 rounded-2xl border border-border/80 bg-card/85 px-4 py-3 shadow backdrop-blur-sm md:mx-7 md:px-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <MobileMenuTrigger />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Workspace</p>
            <h1 className="truncate text-xl font-bold text-foreground">{title}</h1>
            {subtitle ? <p className="truncate text-xs text-muted-foreground md:text-sm">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search actions, content, tasks" className="w-56 pl-9" />
          </div>

          <Button size="sm" className="gap-2" onClick={() => navigate("/content")}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </Button>

          <div className="hidden rounded-lg border border-border/70 bg-muted/35 px-3 py-1.5 text-xs font-semibold text-foreground md:block">
            Credits: {creditBalance}
          </div>

          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt="User" />
                  <AvatarFallback className="bg-primary/15 text-primary">{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
