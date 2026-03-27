import type { AdminSession } from "@/entities/admin/model/types";
import { browserRequest } from "@/shared/api/browser";
import type { ApiItemResponse } from "@/shared/api/contracts";

export function loginAdmin(login: string, password: string) {
  return browserRequest<ApiItemResponse<AdminSession>>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login, password }),
  });
}

export function logoutAdmin() {
  return browserRequest<{ ok: boolean }>("/auth/logout", {
    method: "POST",
  });
}
