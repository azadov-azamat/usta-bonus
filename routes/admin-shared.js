const multer = require("multer");
const { bot } = require("../bot");
const {
  getDisplayFirstName,
  getDisplayLastName,
} = require("../bot/services/user-service");

const TELEGRAM_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
const TELEGRAM_DOCUMENT_MAX_BYTES = 50 * 1024 * 1024;

const excelUpload = multer({
  storage: multer.memoryStorage(),
});

const receiptUpload = multer({
  storage: multer.memoryStorage(),
});

function isTelegramPhotoTooLargeError(error) {
  return (
    error &&
    typeof error.description === "string" &&
    error.description.includes("too big for a photo")
  );
}

async function sendTelegramUploadAction(chatId, action) {
  try {
    await bot.telegram.sendChatAction(chatId, action);
  } catch {}
}

async function sendReceiptToTelegram(user, file, caption) {
  if (file.size > TELEGRAM_DOCUMENT_MAX_BYTES) {
    const maxSizeMb = Math.floor(TELEGRAM_DOCUMENT_MAX_BYTES / (1024 * 1024));
    throw new Error(
      `Chek fayli juda katta. ${maxSizeMb} MB dan kichik fayl yuklang.`,
    );
  }

  const payload = {
    source: file.buffer,
    filename: file.originalname || `withdrawal-${Date.now()}`,
  };

  const shouldSendAsDocument =
    !String(file.mimetype || "").startsWith("image/") ||
    file.size > TELEGRAM_PHOTO_MAX_BYTES;

  if (shouldSendAsDocument) {
    await sendTelegramUploadAction(user.chatId, "upload_document");
    return bot.telegram.sendDocument(user.chatId, payload, { caption });
  }

  try {
    await sendTelegramUploadAction(user.chatId, "upload_photo");
    return await bot.telegram.sendPhoto(
      user.chatId,
      {
        source: file.buffer,
      },
      {
        caption,
      },
    );
  } catch (error) {
    if (!isTelegramPhotoTooLargeError(error)) {
      throw error;
    }

    await sendTelegramUploadAction(user.chatId, "upload_document");
    return bot.telegram.sendDocument(user.chatId, payload, { caption });
  }
}

function getReceiptImageUrl(req, request) {
  if (!request.receiptImageData && !request.receiptImagePath) {
    return null;
  }

  return `${req.protocol}://${req.get("host")}/api/admin/withdrawals/${request.id}/receipt`;
}

function getRegistrationPhotoUrl(req, user) {
  if (!user.registrationPhotoData && !user.registrationPhotoFileId) {
    return null;
  }

  return `${req.protocol}://${req.get("host")}/api/admin/users/${user.id}/registration-photo`;
}

function mapUser(user, req) {
  const promoCodes = user.activatedPromoCodes || [];
  const withdrawals = user.withdrawalRequests || [];
  const withdrawnAmount = withdrawals
    .filter((request) => request.status !== "rejected")
    .reduce((total, request) => total + Number(request.amount), 0);
  const fullName = [
    getDisplayFirstName(user),
    getDisplayLastName(user),
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: user.id,
    telegramId: user.telegramId,
    fullName,
    telegramFullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
    username: user.username,
    phoneNumber: user.phoneNumber,
    language: user.language,
    balance: Number(user.balance),
    isRegistered: user.isRegistered,
    registrationStatus: user.registrationStatus,
    approvedAt: user.approvedAt,
    registrationPhotoSubmittedAt: user.registrationPhotoSubmittedAt,
    registrationPhotoUrl: req ? getRegistrationPhotoUrl(req, user) : null,
    promoCodesCount: promoCodes.length,
    totalEarned: promoCodes.reduce(
      (total, code) =>
        total + Number(code.product ? code.product.bonusAmount : 0),
      0,
    ),
    totalWithdrawn: withdrawnAmount,
    createdAt: user.createdAt,
  };
}

function mapAdminSession(user) {
  return {
    id: user.id,
    login: user.login,
    role: user.role,
    fullName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") || "Admin",
  };
}

function mapProduct(product) {
  const codes = product.promoCodes || [];

  return {
    id: product.id,
    name: product.name,
    quantity: product.quantity,
    bonusAmount: Number(product.bonusAmount),
    generatedCodesCount: codes.length,
    activatedCodesCount: codes.filter((code) => code.status === "activated")
      .length,
    availableCodesCount: codes.filter((code) => code.status === "new").length,
    createdAt: product.createdAt,
  };
}

function mapPromoCode(code) {
  return {
    id: code.id,
    code: code.code,
    status: code.status,
    activatedAt: code.activatedAt,
    activatedBy: code.activatedBy
      ? {
          id: code.activatedBy.id,
          telegramId: code.activatedBy.telegramId,
          fullName: [
            getDisplayFirstName(code.activatedBy),
            getDisplayLastName(code.activatedBy),
          ]
            .filter(Boolean)
            .join(" "),
          phoneNumber: code.activatedBy.phoneNumber,
        }
      : null,
  };
}

function mapWithdrawal(req, request) {
  return {
    id: request.id,
    amount: Number(request.amount),
    cardNumber: request.cardNumber,
    status: request.status,
    requestedAt: request.requestedAt,
    completedAt: request.completedAt,
    receiptImagePath: request.receiptImagePath,
    receiptImageUrl: getReceiptImageUrl(req, request),
    user: request.user
      ? {
          id: request.user.id,
          telegramId: request.user.telegramId,
          fullName: [
            getDisplayFirstName(request.user),
            getDisplayLastName(request.user),
          ]
            .filter(Boolean)
            .join(" "),
          phoneNumber: request.user.phoneNumber,
          language: request.user.language,
          chatId: request.user.chatId,
        }
      : null,
  };
}

module.exports = {
  excelUpload,
  getRegistrationPhotoUrl,
  mapAdminSession,
  mapProduct,
  mapPromoCode,
  mapUser,
  mapWithdrawal,
  receiptUpload,
  sendReceiptToTelegram,
};
