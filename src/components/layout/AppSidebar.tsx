import { useState, useEffect, createContext, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Share2,
  Mail,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Content Studio", url: "/app/content", icon: FileText },
  { title: "Social", url: "/app/social", icon: Share2 },
  { title: "Email", url: "/app/email", icon: Mail },
  { title: "Competitors", url: "/app/competitors", icon: Users },
  { title: "Analytics", url: "/app/analytics", icon: BarChart3 },
];

const bottomNavItems = [{ title: "Settings", url: "/app/settings", icon: Settings }];

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      document.documentElement.style.setProperty("--sidebar-width", "0rem");
      return;
    }
    document.documentElement.style.setProperty("--sidebar-width", collapsed ? "5rem" : "17rem");
  }, [collapsed, isMobile]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();

  const renderItem = (item: (typeof navItems)[number] | (typeof bottomNavItems)[number]) => {
    const isActive = location.pathname === item.url;

    const link = (
      <NavLink
        to={item.url}
        onClick={onNavigate}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{item.title}</span>}
      </NavLink>
    );

    if (!collapsed) return <div key={item.title}>{link}</div>;

    return (
      <Tooltip key={item.title} delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <>
      <div className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">Marketing OS</p>
              <p className="truncate text-xs text-sidebar-foreground/70">Growth workspace</p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-2 py-4">{navItems.map(renderItem)}</nav>

      <div className="space-y-1.5 border-t border-sidebar-border px-2 py-4">{bottomNavItems.map(renderItem)}</div>
    </>
  );
}

export function AppSidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebarContext();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-r border-sidebar-border bg-sidebar p-0">
          <div className="flex h-full flex-col">
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        collapsed ? "w-20" : "w-[17rem]"
      )}
    >
      <SidebarContent collapsed={collapsed} />
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

export function MobileMenuTrigger() {
  const { mobileOpen, setMobileOpen } = useSidebarContext();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-foreground hover:bg-accent"
      onClick={() => setMobileOpen(!mobileOpen)}
      aria-label="Toggle menu"
    >
      {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );
}
