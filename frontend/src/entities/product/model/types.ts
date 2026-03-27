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

export type PromoCodeItem = {
  id: number;
  code: string;
  status: "new" | "activated";
  activatedAt: string | null;
  activatedBy: {
    id: number;
    telegramId: string | null;
    fullName: string;
    phoneNumber: string | null;
  } | null;
};

export type ProductDetail = ProductItem & {
  promoCodes: PromoCodeItem[];
};
