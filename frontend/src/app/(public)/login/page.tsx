import { redirectAuthenticatedAdmin } from "@/features/auth/api/server";
import { LoginForm } from "@/widgets/auth-login/ui/login-form";

export default async function LoginPage() {
  await redirectAuthenticatedAdmin();
  return <LoginForm />;
}
