"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { can } from "@/lib/auth/rbac";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { NAV_ITEMS, isNavActive } from "./nav-items";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.cap || can(role, item.cap));

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const active = isNavActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary/15 text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                active ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarBrand() {
  return (
    <Link
      href="/admin"
      className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4"
    >
      {/* Logo placeholder — swap for the brand mark when available. */}
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
        X
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-sidebar-foreground">
          {APP_NAME}
        </span>
        <span className="text-[11px] text-sidebar-foreground/55">
          {APP_TAGLINE}
        </span>
      </span>
    </Link>
  );
}

/** Desktop fixed sidebar. */
export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar lg:flex">
      <SidebarBrand />
      <SidebarNav />
    </aside>
  );
}
