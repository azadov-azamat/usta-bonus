const { Markup } = require("telegraf");
const { User } = require("../../models");
const { formatMoney } = require("../utils/formatters");
const { formatCardNumber } = require("../utils/card-number");

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
  const fullName = [getOptionalText(user.firstName), getOptionalText(user.lastName)]
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

async function notifyAdminsAboutWithdrawalRequest(telegram, user, withdrawalRequest) {
  if (!telegram) {
    return;
  }

  const admins = await User.findAll({
    where: { role: "admin" },
    attributes: ["id", "chatId"],
  });

  const adminChatIds = admins
    .map((admin) => String(admin.chatId || "").trim())
    .filter(Boolean);

  if (!adminChatIds.length) {
    return;
  }

  const message = getAdminWithdrawalMessage(user, withdrawalRequest);
  const adminUrl = getAdminWithdrawalRequestsUrl();
  const replyMarkup = Markup.inlineKeyboard([
    [Markup.button.url("Saytga o'tish", adminUrl)],
  ]);

  const results = await Promise.allSettled(
    adminChatIds.map((chatId) =>
      telegram.sendMessage(chatId, message, replyMarkup),
    ),
  );

  for (const result of results) {
    if (result.status === "rejected") {
      console.error(
        "Admin withdrawal notification yuborilmadi:",
        result.reason,
      );
    }
  }
}

module.exports = {
  notifyAdminsAboutWithdrawalRequest,
};
