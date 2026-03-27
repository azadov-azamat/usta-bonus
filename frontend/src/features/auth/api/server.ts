import { redirect } from "next/navigation";
import type { AdminSession } from "@/entities/admin/model/types";
import { ApiError } from "@/shared/api/api-error";
import type { ApiItemResponse } from "@/shared/api/contracts";
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  LOGIN_ROUTE,
} from "@/shared/config/routes";
import { serverRequest } from "@/shared/api/server";

export async function getAdminSession() {
  try {
    const response = await serverRequest<ApiItemResponse<AdminSession>>(
      "/auth/session",
    );
    return response.item;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect(LOGIN_ROUTE);
  }

  return session;
}

export async function redirectAuthenticatedAdmin() {
  const session = await getAdminSession();

  if (session) {
    redirect(DEFAULT_AUTHENTICATED_ROUTE);
  }
}
