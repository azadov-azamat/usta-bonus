import { redirect } from "next/navigation";
import { getAdminSession } from "@/features/auth/api/server";
import { DEFAULT_AUTHENTICATED_ROUTE, LOGIN_ROUTE } from "@/shared/config/routes";

export default async function HomePage() {
  const session = await getAdminSession();
  redirect(session ? DEFAULT_AUTHENTICATED_ROUTE : LOGIN_ROUTE);
}
