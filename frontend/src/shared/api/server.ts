import { cookies, headers } from "next/headers";
import { ApiError } from "@/shared/api/api-error";

async function readError(response: Response) {
  let message = "So'rov bajarilmadi.";

  try {
    const payload = (await response.json()) as { message?: string };
    if (payload.message) {
      message = payload.message;
    }
  } catch {}

  return new ApiError(message, response.status);
}

async function getApiBaseUrl() {
  const configuredBaseUrl =
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");

  if (host) {
    const protocol =
      requestHeaders.get("x-forwarded-proto") ||
      (host.includes("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");

    return `${protocol}://${host}`;
  }

  return "http://127.0.0.1:3001";
}

export async function serverRequest<T>(path: string, init?: RequestInit) {
  const cookieHeader = (await cookies()).toString();
  const headers = new Headers(init?.headers);
  const apiBaseUrl = await getApiBaseUrl();

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const response = await fetch(`${apiBaseUrl}/api/admin${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw await readError(response);
  }

  return (await response.json()) as T;
}
