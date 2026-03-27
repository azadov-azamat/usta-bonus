export type ApiListResponse<T> = {
  ok: boolean;
  items: T[];
};

export type ApiItemResponse<T> = {
  ok: boolean;
  item: T;
};
