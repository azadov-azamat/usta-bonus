"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { loginAdmin } from "@/features/auth/api/client";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const nextPath =
    searchParams.get("next") && searchParams.get("next")?.startsWith("/")
      ? searchParams.get("next")
      : DEFAULT_AUTHENTICATED_ROUTE;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      await loginAdmin(login, password);
      router.replace(nextPath || DEFAULT_AUTHENTICATED_ROUTE);
      router.refresh();
    } catch (caughtError) {
      setError((caughtError as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(214,211,209,0.45),transparent_24%),linear-gradient(180deg,#fafaf9_0%,#f5f5f4_100%)]" />
      <Card className="w-full max-w-md animate-surface-enter">
        <CardHeader className="space-y-5">
          <div className="flex size-14 items-center justify-center rounded-[20px] border border-border/70 bg-background/80">
            <ShieldCheck className="size-7" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Admin panel
            </p>
            <CardTitle className="text-3xl">Minimal boshqaruv markazi</CardTitle>
            <CardDescription>
              Login va parol bilan kiring. Sessiya cookie orqali saqlanadi va
              protected route’lar avtomatik tekshiriladi.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="login">
                Login
              </label>
              <Input
                id="login"
                autoComplete="username"
                placeholder="admin"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Parol
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <Button className="w-full" size="lg" type="submit" disabled={isPending}>
              {isPending ? "Tekshirilmoqda..." : "Kirish"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
