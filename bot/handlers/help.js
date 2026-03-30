const { t } = require("../i18n");
const {
  promptForFirstName,
  promptForLastName,
  promptForLanguage,
  promptForPhone,
  promptForRegistrationPhoto,
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

const GENERIC_HELP_TEXT = [
  "🚀 /start - botni ishga tushirish",
  "🆘 /help - yordam",
  "🔒 /privacy - maxfiylik haqida",
  "",
  "📞 Savol yoki taklif bo'lsa, +998912605763 raqami bilan bog'lanishingiz mumkin.",
  "",
  "🌐 Avval tilni tanlang.",
  "🌐 Сначала выберите язык.",
].join("\n");

async function handleHelp(ctx) {
  const user = ctx.state.user;
  const sessionState = getSessionState(ctx);

  if (!hasSelectedLanguage(user)) {
    resetNavigation(sessionState, PAGES.LANGUAGE);
    await sendCtxChatAction(ctx, "typing");
    await ctx.reply(GENERIC_HELP_TEXT);
    await promptForLanguage(ctx, { replace: true });
    return;
  }

  const locale = getUserLocale(user);

  if (!hasEnteredFirstName(user)) {
    resetNavigation(sessionState, PAGES.REGISTRATION_FIRST_NAME);
    await sendCtxChatAction(ctx, "typing");
    await ctx.reply(t(locale, "helpMessage"));
    await promptForFirstName(ctx, user, { replace: true });
    return;
  }

  if (!hasEnteredLastName(user)) {
    resetNavigation(sessionState, PAGES.REGISTRATION_LAST_NAME);
    await sendCtxChatAction(ctx, "typing");
    await ctx.reply(t(locale, "helpMessage"));
    await promptForLastName(ctx, user, { replace: true });
    return;
  }

  if (!hasPhoneNumber(user)) {
    resetNavigation(sessionState, PAGES.CONTACT);
    await sendCtxChatAction(ctx, "typing");
    await ctx.reply(t(locale, "helpMessage"));
    await promptForPhone(ctx, user, { replace: true });
    return;
  }

  if (!isUserApproved(user)) {
    if (isAwaitingRegistrationPhoto(user)) {
      resetNavigation(sessionState, PAGES.REGISTRATION_PHOTO);
      await sendCtxChatAction(ctx, "typing");
      await ctx.reply(t(locale, "helpMessage"));
      await promptForRegistrationPhoto(ctx, user, { replace: true });
      return;
    }

    if (isPendingRegistrationApproval(user)) {
      resetNavigation(sessionState, PAGES.REGISTRATION_PENDING);
      await sendCtxChatAction(ctx, "typing");
      await ctx.reply(t(locale, "registrationPendingApproval"));
      return;
    }
  }

  resetNavigation(sessionState, PAGES.MAIN_MENU);
  await sendCtxChatAction(ctx, "typing");
  await ctx.reply(t(locale, "helpMessage"));
}

module.exports = handleHelp;
