import type { ApplicationItem } from "@/entities/application/model/types";
import type { ProductDetail, ProductItem } from "@/entities/product/model/types";
import type { UserItem } from "@/entities/user/model/types";
import type { ApiItemResponse, ApiListResponse } from "@/shared/api/contracts";
import { serverRequest } from "@/shared/api/server";

export async function getUsers() {
  const response = await serverRequest<ApiListResponse<UserItem>>("/users");
  return response.items;
}

export async function getProducts() {
  const response = await serverRequest<ApiListResponse<ProductItem>>("/products");
  return response.items;
}

export async function getProductDetail(id: string) {
  const response = await serverRequest<ApiItemResponse<ProductDetail>>(
    `/products/${id}`,
  );
  return response.item;
}

export async function getApplications() {
  const response =
    await serverRequest<ApiListResponse<ApplicationItem>>("/withdrawals");
  return response.items;
}
