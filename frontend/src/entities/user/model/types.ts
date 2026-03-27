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
