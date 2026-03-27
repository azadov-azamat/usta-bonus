import type { ReactNode } from "react";
import { requireAdminSession } from "@/features/auth/api/server";
import { AdminShell } from "@/widgets/app-shell/ui/admin-shell";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminSession();
  return <AdminShell session={session}>{children}</AdminShell>;
}
