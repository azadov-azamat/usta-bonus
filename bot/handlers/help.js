const { t } = require("../i18n");
const { getMainMenuKeyboard } = require("../keyboards");
const {
  promptForLanguage,
  promptForPhone,
} = require("../services/menu-service");
const {
  hasPhoneNumber,
  hasSelectedLanguage,
} = require("../services/user-service");
const { PAGES, getSessionState, resetNavigation } = require("../state/navigation");
const { getUserLocale } = require("../utils/locale");

const GENERIC_HELP_TEXT = [
  "/start - botni ishga tushirish",
  "/help - yordam",
  "",
  "Avval tilni tanlang.",
  "Сначала выберите язык.",
  "Аввал тилни танланг.",
].join("\n");

async function handleHelp(ctx) {
  const user = ctx.state.user;
  const sessionState = getSessionState(ctx);

  if (!hasSelectedLanguage(user)) {
    resetNavigation(sessionState, PAGES.LANGUAGE);
    await ctx.reply(GENERIC_HELP_TEXT);
    await promptForLanguage(ctx, { replace: true });
    return;
  }

  const locale = getUserLocale(user);

  if (!hasPhoneNumber(user)) {
    resetNavigation(sessionState, PAGES.CONTACT);
    await ctx.reply(t(locale, "helpMessage"));
    await promptForPhone(ctx, user, { replace: true });
    return;
  }

  resetNavigation(sessionState, PAGES.MAIN_MENU);
  await ctx.reply(
    t(locale, "helpMessage"),
    getMainMenuKeyboard(locale),
  );
}

module.exports = handleHelp;
