import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.18),transparent_28%),radial-gradient(circle_at_80%_80%,hsl(var(--chart-2)/0.16),transparent_36%)]" />
      <div className="relative w-full max-w-xl rounded-3xl border border-border/70 bg-card/90 p-10 text-center shadow-xl backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Compass className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">404</p>
        <h1 className="mt-2 text-4xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The path <span className="font-mono">{location.pathname}</span> does not exist in this workspace.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/">Go to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/content">Open content studio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
