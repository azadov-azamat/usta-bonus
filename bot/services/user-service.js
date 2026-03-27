const { User } = require("../../models");
const { isSupportedLocale } = require("../utils/locale");

function hasSelectedLanguage(user) {
  return Boolean(user?.languageSelected) && isSupportedLocale(user.language);
}

function hasPhoneNumber(user) {
  return Boolean(String(user?.phoneNumber || "").trim());
}

function syncRegistrationStatus(user) {
  user.isRegistered = hasSelectedLanguage(user) && hasPhoneNumber(user);
}

async function ensureTelegramUser(ctx) {
  const telegramId = String(ctx.from.id);
  const chatId = ctx.chat?.id ? String(ctx.chat.id) : null;

  const [user] = await User.findOrCreate({
    where: { telegramId },
    defaults: {
      role: "worker",
      telegramId,
      chatId,
      username: ctx.from.username || null,
      firstName: ctx.from.first_name || null,
      lastName: ctx.from.last_name || null,
      languageSelected: false,
      isRegistered: false,
    },
  });

  user.chatId = chatId || user.chatId || null;
  user.username = ctx.from.username || user.username || null;
  user.firstName = ctx.from.first_name || user.firstName || null;
  user.lastName = ctx.from.last_name || user.lastName || null;
  syncRegistrationStatus(user);
  await user.save();

  return user;
}

async function setUserLanguage(user, locale) {
  user.language = locale;
  user.languageSelected = true;
  syncRegistrationStatus(user);
  await user.save();
  return user;
}

async function setUserPhoneNumber(user, phoneNumber) {
  user.phoneNumber = phoneNumber || user.phoneNumber;
  syncRegistrationStatus(user);
  await user.save();
  return user;
}

module.exports = {
  ensureTelegramUser,
  hasPhoneNumber,
  hasSelectedLanguage,
  setUserLanguage,
  setUserPhoneNumber,
  syncRegistrationStatus,
};
