const { Markup } = require("telegraf");
const { User } = require("../../models");
const { adminBot, isAdminBotEnabled } = require("../../admin-bot");
const { formatMoney } = require("../utils/formatters");
const { formatCardNumber } = require("../utils/card-number");
const { sendTelegramChatAction } = require("../utils/chat-actions");
const {
  getDisplayFirstName,
  getDisplayLastName,
} = require("./user-service");

function joinUrl(baseUrl, pathname) {
  const normalizedBase = String(baseUrl || "").trim();

  if (!normalizedBase) {
    return null;
  }

  try {
    const baseWithSlash = normalizedBase.endsWith("/")
      ? normalizedBase
      : `${normalizedBase}/`;

    return new URL(pathname.replace(/^\//, ""), baseWithSlash).toString();
  } catch {
    return normalizedBase;
  }
}

function getAdminWithdrawalRequestsUrl() {
  return (
    process.env.ADMIN_WITHDRAWALS_URL ||
    joinUrl(process.env.ADMIN_PANEL_URL, "withdrawal-requests") ||
    joinUrl(process.env.BOT_BASE_URL, "admin/withdrawal-requests") ||
    "http://localhost:3001/withdrawal-requests"
  );
}

function getOptionalText(value) {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || null;
}

function formatPhoneNumber(phoneNumber) {
  const rawValue = getOptionalText(phoneNumber);

  if (!rawValue) {
    return null;
  }

  const normalizedDigits = rawValue.replace(/[^\d+]/g, "");

  if (!normalizedDigits) {
    return null;
  }

  if (normalizedDigits.startsWith("+")) {
    return normalizedDigits;
  }

  if (normalizedDigits.startsWith("00")) {
    return `+${normalizedDigits.slice(2)}`;
  }

  return `+${normalizedDigits}`;
}

function getUserDisplayName(user) {
  const fullName = [
    getOptionalText(getDisplayFirstName(user)),
    getOptionalText(getDisplayLastName(user)),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  const username = getOptionalText(user.username);

  if (username) {
    return `@${username}`;
  }

  return null;
}

function getRegistrationDecisionAction(action, userId) {
  return `registration:${action}:${userId}`;
}

function getRegistrationDecisionKeyboard(userId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "✅ Tasdiqlash",
        getRegistrationDecisionAction("approve", userId),
      ),
      Markup.button.callback(
        "🔁 Qayta yuborish",
        getRegistrationDecisionAction("retry", userId),
      ),
    ],
  ]);
}

async function getAdminChatIds() {
  const admins = await User.findAll({
    where: { role: "admin" },
    attributes: ["id", "adminChatId"],
  });

  return admins
    .map((admin) => String(admin.adminChatId || "").trim())
    .filter(Boolean);
}

function getAdminRegistrationMessage(user) {
  const displayName = getUserDisplayName(user);
  const username = getOptionalText(user.username);
  const phoneNumber = formatPhoneNumber(user.phoneNumber);
  const submittedAt = new Date(
    user.registrationPhotoSubmittedAt || Date.now(),
  ).toLocaleString("uz-UZ");
  const lines = [`🆕 Yangi registratsiya so'rovi #${user.id}`];

  if (displayName) {
    lines.push(`👤 Foydalanuvchi: ${displayName}`);
  }

  if (phoneNumber) {
    lines.push(`📞 Telefon: ${phoneNumber}`);
  }

  if (username && displayName !== `@${username}`) {
    lines.push(`🔗 Username: @${username}`);
  }

  lines.push(`🌐 Til: ${getOptionalText(user.language) || "uz"}`);
  lines.push(`🕒 Yuborilgan: ${submittedAt}`);
  lines.push("");
  lines.push("Rasmni tekshirib, foydalanuvchini tasdiqlang yoki qayta yuborishni so'rang.");

  return lines.join("\n");
}

function getAdminWithdrawalMessage(user, withdrawalRequest) {
  const displayName = getUserDisplayName(user);
  const username = getOptionalText(user.username);
  const phoneNumber = formatPhoneNumber(user.phoneNumber);
  const requestedAt = new Date(
    withdrawalRequest.requestedAt || Date.now(),
  ).toLocaleString("uz-UZ");

  const lines = [`💸 Yangi ariza #${withdrawalRequest.id}`];

  if (displayName) {
    lines.push(`👤 Foydalanuvchi: ${displayName}`);
  }

  if (phoneNumber) {
    lines.push(`📞 Telefon: ${phoneNumber}`);
  }

  if (username && displayName !== `@${username}`) {
    lines.push(`🔗 Username: @${username}`);
  }

  lines.push(
    `💳 Karta: ${
      formatCardNumber(withdrawalRequest.cardNumber) || withdrawalRequest.cardNumber
    }`,
  );
  lines.push(`💰 Summa: ${formatMoney("uz", withdrawalRequest.amount)} so'm`);
  lines.push(`🕒 Vaqt: ${requestedAt}`);

  return lines.join("\n");
}

async function sendToAdminChats(sendOperation) {
  if (!isAdminBotEnabled()) {
    console.error("Admin bot yoqilmagan. ADMIN_BOT_TOKEN ni sozlash kerak.");
    return;
  }

  const adminChatIds = await getAdminChatIds();

  if (!adminChatIds.length) {
    return;
  }

  const results = await Promise.allSettled(
    adminChatIds.map((chatId) => sendOperation(chatId)),
  );

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Admin bot notification yuborilmadi:", result.reason);
    }
  }
}

async function notifyAdminsAboutRegistrationReview(sourceTelegram, user) {
  if (!user?.registrationPhotoFileId) {
    return;
  }

  let photoBuffer = user.registrationPhotoData || null;

  if (!photoBuffer && sourceTelegram) {
    const fileUrl = await sourceTelegram.getFileLink(user.registrationPhotoFileId);
    const response = await fetch(fileUrl.toString());

    if (!response.ok) {
      throw new Error(
        `Registratsiya rasmi Telegram'dan yuklanmadi: ${response.status}`,
      );
    }

    photoBuffer = Buffer.from(await response.arrayBuffer());
  }

  if (!photoBuffer) {
    throw new Error("Registratsiya rasmi topilmadi.");
  }

  const caption = getAdminRegistrationMessage(user);
  const replyMarkup = getRegistrationDecisionKeyboard(user.id);
  const filename = user.registrationPhotoName || `registration-${user.id}.jpg`;

  await sendToAdminChats((chatId) =>
    (async () => {
      await sendTelegramChatAction(adminBot.telegram, chatId, "upload_photo");
      return adminBot.telegram.sendPhoto(
        chatId,
        {
          source: photoBuffer,
          filename,
        },
        {
          caption,
          reply_markup: replyMarkup.reply_markup,
        },
      );
    })(),
  );
}

async function notifyAdminsAboutWithdrawalRequest(user, withdrawalRequest) {
  const message = getAdminWithdrawalMessage(user, withdrawalRequest);
  const adminUrl = getAdminWithdrawalRequestsUrl();
  const extra = adminUrl
    ? Markup.inlineKeyboard([
        [Markup.button.url("Saytga o'tish", adminUrl)],
      ])
    : undefined;

  await sendToAdminChats((chatId) =>
    (async () => {
      await sendTelegramChatAction(adminBot.telegram, chatId, "typing");
      return adminBot.telegram.sendMessage(chatId, message, extra);
    })(),
  );
}

module.exports = {
  notifyAdminsAboutRegistrationReview,
  notifyAdminsAboutWithdrawalRequest,
};
