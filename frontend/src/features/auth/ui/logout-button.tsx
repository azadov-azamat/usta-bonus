"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAdmin } from "@/features/auth/api/client";
import { Button } from "@/shared/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);

    try {
      await logoutAdmin();
    } finally {
      router.replace("/login");
      router.refresh();
      setIsPending(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={isPending}>
      <LogOut className="size-4" />
      {isPending ? "Chiqilmoqda..." : "Chiqish"}
    </Button>
  );
}
