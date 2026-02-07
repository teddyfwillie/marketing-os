import { ReactNode } from "react";
import { AppSidebar, SidebarProvider } from "./AppSidebar";
import { Header } from "./Header";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-transparent">
        <AppSidebar />
        <div className="flex min-h-screen flex-1 flex-col md:ml-[var(--sidebar-width,17rem)] transition-all duration-200">
          <div className="fixed left-0 right-0 top-0 z-30 md:left-[var(--sidebar-width,17rem)] transition-all duration-200">
            <Header title={title} subtitle={subtitle} />
          </div>
          <main className="mt-20 flex-1 px-4 pb-8 md:px-7">
            <div className="page-shell">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
