const { t } = require("../i18n");
const { getMainMenuKeyboard } = require("../keyboards");
const {
  hasPhoneNumber,
  hasSelectedLanguage,
} = require("../services/user-service");
const { PAGES, getSessionState, resetNavigation } = require("../state/navigation");
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
    await ctx.reply(GENERIC_PRIVACY_TEXT);
    return;
  }

  const locale = getUserLocale(user);

  if (!hasPhoneNumber(user)) {
    resetNavigation(sessionState, PAGES.CONTACT);
    await ctx.reply(t(locale, "privacyMessage"));
    return;
  }

  resetNavigation(sessionState, PAGES.MAIN_MENU);
  await ctx.reply(t(locale, "privacyMessage"), getMainMenuKeyboard(locale));
}

module.exports = handlePrivacy;
