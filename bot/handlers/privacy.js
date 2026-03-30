const { t } = require("../i18n");
const {
  promptForFirstName,
  promptForLastName,
  promptForRegistrationPhoto,
  showPendingApprovalMessage,
} = require("../services/menu-service");
const {
  hasEnteredFirstName,
  hasEnteredLastName,
  hasPhoneNumber,
  hasSelectedLanguage,
  isAwaitingRegistrationPhoto,
  isPendingRegistrationApproval,
  isUserApproved,
} = require("../services/user-service");
const { PAGES, getSessionState, resetNavigation } = require("../state/navigation");
const { sendCtxChatAction } = require("../utils/chat-actions");
const { getUserLocale } = require("../utils/locale");

const GENERIC_PRIVACY_TEXT = [
  "🔒 Maxfiylik / Конфиденциальность",
  "",
  "Bot faqat xizmat ishlashi uchun kerakli ma'lumotlarni saqlaydi: Telegram identifikatori, tanlangan til, telefon raqami, promokodlar, balans va pul yechish uchun karta ma'lumotlari.",
  "Бот хранит только данные, необходимые для работы сервиса: Telegram ID, выбранный язык, номер телефона, промокоды, баланс и данные карты для вывода средств.",
  "",
  "📞 Savol yoki taklif bo'lsa, +998912605763 raqami bilan bog'lanishingiz mumkin.",
  "📞 Если у вас есть вопрос или предложение, свяжитесь по номеру +998912605763.",
].join("\n");

async function handlePrivacy(ctx) {
  const user = ctx.state.user;
  const sessionState = getSessionState(ctx);

  if (!hasSelectedLanguage(user)) {
    resetNavigation(sessionState, PAGES.LANGUAGE);
    await sendCtxChatAction(ctx, "typing");
    await ctx.reply(GENERIC_PRIVACY_TEXT);
    return;
  }

  const locale = getUserLocale(user);

  if (!hasEnteredFirstName(user)) {
    resetNavigation(sessionState, PAGES.REGISTRATION_FIRST_NAME);
    await sendCtxChatAction(ctx, "typing");
    await ctx.reply(t(locale, "privacyMessage"));
    await promptForFirstName(ctx, user, { replace: true });
    return;
  }

  if (!hasEnteredLastName(user)) {
    resetNavigation(sessionState, PAGES.REGISTRATION_LAST_NAME);
    await sendCtxChatAction(ctx, "typing");
    await ctx.reply(t(locale, "privacyMessage"));
    await promptForLastName(ctx, user, { replace: true });
    return;
  }

  if (!hasPhoneNumber(user)) {
    resetNavigation(sessionState, PAGES.CONTACT);
    await sendCtxChatAction(ctx, "typing");
    await ctx.reply(t(locale, "privacyMessage"));
    return;
  }

  if (!isUserApproved(user)) {
    if (isAwaitingRegistrationPhoto(user)) {
      resetNavigation(sessionState, PAGES.REGISTRATION_PHOTO);
      await sendCtxChatAction(ctx, "typing");
      await ctx.reply(t(locale, "privacyMessage"));
      await promptForRegistrationPhoto(ctx, user, { replace: true });
      return;
    }

    if (isPendingRegistrationApproval(user)) {
      resetNavigation(sessionState, PAGES.REGISTRATION_PENDING);
      await sendCtxChatAction(ctx, "typing");
      await ctx.reply(t(locale, "privacyMessage"));
      await showPendingApprovalMessage(ctx, user, { replace: true });
      return;
    }
  }

  resetNavigation(sessionState, PAGES.MAIN_MENU);
  await sendCtxChatAction(ctx, "typing");
  await ctx.reply(t(locale, "privacyMessage"));
}

module.exports = handlePrivacy;
