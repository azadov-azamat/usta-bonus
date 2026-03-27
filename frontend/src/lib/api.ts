export type UserItem = {
  id: number;
  telegramId: string;
  fullName: string;
  username: string | null;
  phoneNumber: string | null;
  language: string;
  balance: number;
  isRegistered: boolean;
  promoCodesCount: number;
  totalEarned: number;
  totalWithdrawn: number;
  createdAt: string;
};

export type ProductItem = {
  id: number;
  name: string;
  quantity: number;
  bonusAmount: number;
  generatedCodesCount: number;
  activatedCodesCount: number;
  availableCodesCount: number;
  createdAt: string;
};

export type WithdrawalItem = {
  id: number;
  amount: number;
  cardNumber: string;
  status: "pending" | "completed" | "rejected";
  requestedAt: string;
  completedAt: string | null;
  receiptImagePath: string | null;
  receiptImageUrl: string | null;
  user: {
    id: number;
    telegramId: string;
    fullName: string;
    phoneNumber: string | null;
    language: string;
    chatId: string;
  } | null;
};

export type AdminSession = {
  id: number;
  login: string;
  role: "admin";
  fullName: string;
};

type ApiListResponse<T> = {
  ok: boolean;
  items: T[];
};

type ApiItemResponse<T> = {
  ok: boolean;
  item: T;
};

type ProductImportResponse = {
  ok: boolean;
  importedProducts: number;
  generatedPromoCodes: number;
};

type WithdrawalCompleteResponse = {
  ok: boolean;
  item: WithdrawalItem;
};

const API_BASE = import.meta.env.VITE_API_BASE || "";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init
  });

  if (!response.ok) {
    let message = "So'rov bajarilmadi.";

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {}

    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export function getAdminSession() {
  return request<ApiItemResponse<AdminSession>>("/api/admin/auth/session");
}

export function loginAdmin(login: string, password: string) {
  return request<ApiItemResponse<AdminSession>>("/api/admin/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      login,
      password
    })
  });
}

export function logoutAdmin() {
  return request<{ ok: boolean }>("/api/admin/auth/logout", {
    method: "POST"
  });
}

export function getUsers() {
  return request<ApiListResponse<UserItem>>("/api/admin/users");
}

export function getProducts() {
  return request<ApiListResponse<ProductItem>>("/api/admin/products");
}

export function getWithdrawals() {
  return request<ApiListResponse<WithdrawalItem>>("/api/admin/withdrawals");
}

export async function importProducts(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return request<ProductImportResponse>("/api/admin/products/import", {
    method: "POST",
    body: formData
  });
}

export async function completeWithdrawal(id: number, file: File) {
  const formData = new FormData();
  formData.append("receipt", file);

  return request<WithdrawalCompleteResponse>(`/api/admin/withdrawals/${id}/complete`, {
    method: "POST",
    body: formData
  });
}
