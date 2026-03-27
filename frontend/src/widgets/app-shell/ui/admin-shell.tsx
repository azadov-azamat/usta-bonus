"use client";

import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { AdminSession } from "@/entities/admin/model/types";
import { LogoutButton } from "@/features/auth/ui/logout-button";
import { navItems } from "@/features/navigation/model/nav-items";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";

type AdminShellProps = {
  session: AdminSession;
  children: ReactNode;
};

export function AdminShell({ session, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[32px] border border-border/70 bg-card/90 p-5 shadow-[0_24px_80px_rgba(10,10,10,0.06)] backdrop-blur">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-[18px] bg-foreground text-background">
                  <LayoutGrid className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Turon
                  </p>
                  <p className="text-lg font-semibold tracking-[-0.04em]">
                    Admin Console
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-border/70 bg-secondary/80 p-4">
                <p className="text-sm font-medium">{session.fullName}</p>
                <p className="mt-1 text-sm text-muted-foreground">@{session.login}</p>
                <Badge className="mt-3 w-fit" variant="secondary">
                  {session.role}
                </Badge>
              </div>
            </div>

            <nav className="grid gap-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group rounded-[24px] border px-4 py-3 transition-all",
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/70 bg-background/70 hover:bg-accent",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex size-9 items-center justify-center rounded-full",
                          isActive
                            ? "bg-background/10"
                            : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{item.title}</p>
                        <p
                          className={cn(
                            "text-sm",
                            isActive ? "text-background/70" : "text-muted-foreground",
                          )}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <LogoutButton />
          </div>
        </aside>

        <main className="rounded-[32px] border border-border/70 bg-card/85 p-6 shadow-[0_24px_80px_rgba(10,10,10,0.05)] backdrop-blur md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
