import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/api/client";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.getToken()) {
      navigate({ to: "/login" });
    } else {
      setReady(true);
    }
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex justify-center items-center bg-background min-h-screen">
        <div className="text-muted-foreground text-sm">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className={cn("transition-all duration-200", collapsed ? "pl-[72px]" : "pl-[260px]")}>
        <TopNavbar onMenuClick={() => setCollapsed((v) => !v)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
