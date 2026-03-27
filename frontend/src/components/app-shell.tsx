import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Boxes, CreditCard, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { to: "/", label: "Foydalanuvchilar", icon: Users },
  { to: "/products", label: "Mahsulotlar", icon: Boxes },
  { to: "/withdrawals", label: "Arizalar", icon: CreditCard }
];

type AppShellProps = {
  children: ReactNode;
  userName: string;
  onLogout: () => Promise<void>;
};

export default function AppShell({ children, userName, onLogout }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,212,138,0.48),transparent_28%),linear-gradient(140deg,#f5efe2_0%,#dce7d6_48%,#edf4ff_100%)] text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[300px_1fr]">
        <aside className="border-b border-white/40 bg-white/45 p-6 backdrop-blur-xl lg:border-r lg:border-b-0 lg:p-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
                Turon Bot
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.07em]">Promo Admin</h1>
            </div>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              Ustalar, promokodlar va karta o‘tkazmalarini shaffof boshqarish uchun
              yagona boshqaruv paneli.
            </p>
          </div>

          <nav className="mt-8 grid gap-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "group inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "border-primary/15 bg-card text-foreground shadow-sm"
                        : "border-transparent bg-white/20 text-muted-foreground hover:border-border hover:bg-white/60 hover:text-foreground"
                    )
                  }
                >
                  <span className="rounded-xl bg-secondary p-2 text-primary transition-colors group-hover:bg-primary/10">
                    <Icon className="size-4" />
                  </span>
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-white/50 bg-white/45 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Tizimga kirgan admin
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.04em]">{userName}</p>
            <Button className="mt-4 w-full" variant="outline" onClick={() => void onLogout()}>
              <LogOut className="size-4" />
              Chiqish
            </Button>
          </div>
        </aside>

        <main className="p-5 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
