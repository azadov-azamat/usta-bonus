const { Markup } = require("telegraf");
const { User } = require("../../models");
const { t } = require("../../bot/i18n");
const { getMainMenuKeyboard } = require("../../bot/keyboards");
const {
  approveTelegramUser,
  getRegistrationStatus,
  requestRegistrationPhotoRetry,
} = require("../../bot/services/user-service");
const {
  sendCtxChatAction,
  sendTelegramChatAction,
} = require("../../bot/utils/chat-actions");
const { getUserLocale } = require("../../bot/utils/locale");

const REGISTRATION_ACTION_REGEX = /^registration:(approve|retry):(\d+)$/;

async function notifyWorkerApproved(user) {
  if (!user?.chatId) {
    return;
  }

  const { bot } = require("../../bot");
  const locale = getUserLocale(user);
  await sendTelegramChatAction(bot.telegram, user.chatId, "typing");
  await bot.telegram.sendMessage(
    user.chatId,
    t(locale, "registrationApproved"),
    getMainMenuKeyboard(locale),
  );
}

async function notifyWorkerRetryRequested(user) {
  if (!user?.chatId) {
    return;
  }

  const { bot } = require("../../bot");
  const locale = getUserLocale(user);

  await sendTelegramChatAction(bot.telegram, user.chatId, "typing");
  await bot.telegram.sendMessage(
    user.chatId,
    t(locale, "registrationPhotoRetryRequested"),
    Markup.removeKeyboard(),
  );
  await sendTelegramChatAction(bot.telegram, user.chatId, "typing");
  await bot.telegram.sendMessage(
    user.chatId,
    t(locale, "shareProfilePhoto"),
    Markup.removeKeyboard(),
  );
}

async function handleRegistrationDecision(ctx) {
  const adminUser = ctx.state.adminUser;
  const matches = REGISTRATION_ACTION_REGEX.exec(ctx.callbackQuery?.data || "");
  const action = matches?.[1];
  const userId = Number(matches?.[2]);

  if (!adminUser) {
    await ctx.answerCbQuery("Bu amal faqat admin uchun.", {
      show_alert: true,
    });
    return;
  }

  if (!action || !userId) {
    await ctx.answerCbQuery();
    return;
  }

  const user = await User.findOne({
    where: {
      id: userId,
      role: "worker",
    },
  });

  if (!user) {
    await ctx.answerCbQuery("Foydalanuvchi topilmadi.", {
      show_alert: true,
    });
    return;
  }

  const status = getRegistrationStatus(user);

  if (status !== "pending_review") {
    await ctx.answerCbQuery("Bu so'rov allaqachon ko'rib chiqilgan.", {
      show_alert: true,
    });

    try {
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch {}

    return;
  }

  await ctx.answerCbQuery("So'rov qayta ishlanmoqda...");

  if (action === "approve") {
    await approveTelegramUser(user);
    try {
      await notifyWorkerApproved(user);
    } catch (error) {
      console.error("Userga approval xabari yuborilmadi:", error);
    }
    try {
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch {}
    await sendCtxChatAction(ctx, "typing");
    await ctx.reply(`✅ User #${user.id} tasdiqlandi.`);
    return;
  }

  await requestRegistrationPhotoRetry(user);
  try {
    await notifyWorkerRetryRequested(user);
  } catch (error) {
    console.error("Userga qayta yuborish xabari yuborilmadi:", error);
  }
  try {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  } catch {}
  await sendCtxChatAction(ctx, "typing");
  await ctx.reply(`🔁 User #${user.id} dan rasm qayta so'raldi.`);
}

module.exports = {
  handleRegistrationDecision,
  REGISTRATION_ACTION_REGEX,
};
