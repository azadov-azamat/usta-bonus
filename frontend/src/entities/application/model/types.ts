export type ApplicationItem = {
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
