import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AppShell from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError,
  getAdminSession,
  logoutAdmin,
  type AdminSession
} from "@/lib/api";
import LoginPage from "@/pages/LoginPage";
import UsersPage from "@/pages/UsersPage";
import ProductsPage from "@/pages/ProductsPage";
import WithdrawalsPage from "@/pages/WithdrawalsPage";

export default function App() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getAdminSession()
      .then((response) => {
        if (active) {
          setSession(response.item);
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        if (!(error instanceof ApiError) || error.status !== 401) {
          console.error("Admin sessiyani tekshirib bo'lmadi:", error);
        }

        setSession(null);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,212,138,0.48),transparent_28%),linear-gradient(140deg,#f5efe2_0%,#dce7d6_48%,#edf4ff_100%)] p-6">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[300px_1fr]">
          <Skeleton className="min-h-80 rounded-[2rem]" />
          <Skeleton className="min-h-96 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage onSuccess={setSession} />;
  }

  async function handleLogout() {
    await logoutAdmin();
    setSession(null);
  }

  return (
    <AppShell userName={session.fullName} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<UsersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/withdrawals" element={<WithdrawalsPage />} />
      </Routes>
    </AppShell>
  );
}
