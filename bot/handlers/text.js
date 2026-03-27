const { t } = require("../i18n");
const {
  getBackKeyboard,
  getContactKeyboard,
  getMainMenuKeyboard,
} = require("../keyboards");
const { activatePromoCode } = require("../services/promo-service");
const {
  askPromoCode,
  askWithdrawalAmount,
  askWithdrawalCard,
  listMyPromoCodes,
  promptForLanguage,
  promptForPhone,
  renderPage,
  showBalance,
  showLanguageSettings,
  showSettingsMenu,
} = require("../services/menu-service");
const {
  hasPhoneNumber,
  hasSelectedLanguage,
  setUserLanguage,
} = require("../services/user-service");
const { createWithdrawalRequest } = require("../services/withdrawal-service");
const {
  PAGES,
  clearFlowState,
  getSessionState,
  goBack,
  resetNavigation,
} = require("../state/navigation");
const { formatMoney } = require("../utils/formatters");
const { getUserLocale } = require("../utils/locale");
const { looksLikePromoCode } = require("../utils/promo-code");

async function replyPromoActivationResult(ctx, user, result) {
  const locale = getUserLocale(user);

  if (!result || result.status === "not_found") {
    await ctx.reply(
      t(locale, "promoNotFound"),
      getMainMenuKeyboard(locale),
    );
    return;
  }

  if (result.status === "already_used") {
    await ctx.reply(
      t(locale, "promoAlreadyUsed"),
      getMainMenuKeyboard(locale),
    );
    return;
  }

  await ctx.reply(
    t(locale, "promoActivated", {
      amount: formatMoney(locale, result.bonusAmount),
    }),
    getMainMenuKeyboard(locale),
  );
}

async function handleLanguageSelection(ctx, user, selectedLocale, sessionState) {
  const isSettingsLanguagePage =
    sessionState.pageKey === PAGES.SETTINGS_LANGUAGE && hasPhoneNumber(user);

  await setUserLanguage(user, selectedLocale);

  if (isSettingsLanguagePage) {
    goBack(sessionState, PAGES.SETTINGS);
    await showSettingsMenu(ctx, user, "languageSaved", { replace: true });
    return;
  }

  if (hasPhoneNumber(user)) {
    resetNavigation(sessionState, PAGES.MAIN_MENU);
    await ctx.reply(
      t(selectedLocale, "languageSaved"),
      getMainMenuKeyboard(selectedLocale),
    );
    return;
  }

  await ctx.reply(t(selectedLocale, "languageSaved"));
  await promptForPhone(ctx, user, { replace: true });
}

function canHandleLanguageSelection(sessionState, user) {
  return (
    !hasSelectedLanguage(user) ||
    sessionState.pageKey === PAGES.LANGUAGE ||
    sessionState.pageKey === PAGES.SETTINGS_LANGUAGE
  );
}

async function handleText(ctx) {
  const user = ctx.state.user;
  const sessionState = getSessionState(ctx);
  const text = String(ctx.message.text || "").trim();
  const selectedLocale = ctx.state.selectedLocale;

  if (selectedLocale && canHandleLanguageSelection(sessionState, user)) {
    await handleLanguageSelection(ctx, user, selectedLocale, sessionState);
    return;
  }

  if (!hasSelectedLanguage(user)) {
    await promptForLanguage(ctx, { replace: true });
    return;
  }

  if (!hasPhoneNumber(user)) {
    const locale = getUserLocale(user);
    await ctx.reply(
      t(locale, "contactRequestOnly"),
      getContactKeyboard(locale),
    );
    return;
  }

  const locale = getUserLocale(user);

  if (text === t(locale, "back")) {
    clearFlowState(sessionState);
    const previousPage = goBack(sessionState, PAGES.MAIN_MENU);
    await renderPage(ctx, user, previousPage, { replace: true });
    return;
  }

  if (text === t(locale, "cancel")) {
    resetNavigation(sessionState, PAGES.MAIN_MENU);
    await ctx.reply(
      t(locale, "actionCanceled"),
      getMainMenuKeyboard(locale),
    );
    return;
  }

  if (text === t(locale, "activatePromo")) {
    await askPromoCode(ctx, user);
    return;
  }

  if (text === t(locale, "myPromocodes")) {
    await listMyPromoCodes(ctx, user);
    return;
  }

  if (text === t(locale, "myBalance")) {
    await showBalance(ctx, user);
    return;
  }

  if (text === t(locale, "withdraw")) {
    if (Number(user.balance) <= 0) {
      await ctx.reply(
        t(locale, "withdrawalNoBalance"),
        getMainMenuKeyboard(locale),
      );
      return;
    }

    await askWithdrawalAmount(ctx, user);
    return;
  }

  if (text === t(locale, "settings")) {
    await showSettingsMenu(ctx, user);
    return;
  }

  if (text === t(locale, "changeLanguage")) {
    await showLanguageSettings(ctx, user);
    return;
  }

  if (sessionState.step === "awaiting_promo_code") {
    resetNavigation(sessionState, PAGES.MAIN_MENU);
    const result = await activatePromoCode(user, text);
    await replyPromoActivationResult(ctx, user, result);
    return;
  }

  if (looksLikePromoCode(text)) {
    resetNavigation(sessionState, PAGES.MAIN_MENU);
    const result = await activatePromoCode(user, text);
    await replyPromoActivationResult(ctx, user, result);
    return;
  }

  if (sessionState.step === "awaiting_withdrawal_amount") {
    const amount = Number(String(text).replace(/[^\d]/g, ""));

    if (!amount) {
      await ctx.reply(
        t(locale, "invalidWithdrawalAmount"),
        getBackKeyboard(locale),
      );
      return;
    }

    if (amount > Number(user.balance)) {
      await ctx.reply(
        t(locale, "withdrawalTooMuch", {
          amount: formatMoney(locale, user.balance),
        }),
        getBackKeyboard(locale),
      );
      return;
    }

    await askWithdrawalCard(ctx, user, amount);
    return;
  }

  if (sessionState.step === "awaiting_withdrawal_card") {
    const amount = Number(sessionState.withdrawalAmount || 0);
    const cardNumber = text.replace(/\s+/g, " ").trim();

    if (!amount || !cardNumber) {
      await ctx.reply(
        t(locale, "invalidWithdrawalAmount"),
        getBackKeyboard(locale),
      );
      return;
    }

    resetNavigation(sessionState, PAGES.MAIN_MENU);
    await createWithdrawalRequest(user, cardNumber, amount);
    await ctx.reply(
      t(locale, "withdrawalCreated"),
      getMainMenuKeyboard(locale),
    );
    return;
  }

  await ctx.reply(
    t(locale, "unknownMenuAction"),
    getMainMenuKeyboard(locale),
  );
}

module.exports = handleText;
