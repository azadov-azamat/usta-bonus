import { ApiError } from "@/shared/api/api-error";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

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

export async function browserRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBaseUrl}/api/admin${path}`, {
    credentials: "include",
    ...init,
  });

  if (!response.ok) {
    throw await readError(response);
  }

  return (await response.json()) as T;
}
