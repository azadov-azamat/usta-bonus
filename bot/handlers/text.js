const { t } = require("../i18n");
const {
  getBackKeyboard,
  getContactKeyboard,
  getMainMenuKeyboard,
} = require("../keyboards");
const { activatePromoCode } = require("../services/promo-service");
const {
  applyLanguageSelection,
  askPromoCode,
  askSettingsCard,
  askWithdrawalAmount,
  askWithdrawalCard,
  confirmCardEntry,
  listMyPromoCodes,
  promptForFirstName,
  promptForLastName,
  promptForLanguage,
  promptForPhone,
  promptForRegistrationPhoto,
  renderPage,
  showBalance,
  showLanguageSettings,
  showSettingsMenu,
  showPendingApprovalMessage,
} = require("../services/menu-service");
const {
  getSavedWithdrawalCard,
  hasEnteredFirstName,
  hasEnteredLastName,
  hasPhoneNumber,
  hasSavedWithdrawalCard,
  hasSelectedLanguage,
  isAwaitingRegistrationPhoto,
  isPendingRegistrationApproval,
  isUserApproved,
  setUserEnteredFirstName,
  setUserEnteredLastName,
} = require("../services/user-service");
const {
  notifyAdminsAboutWithdrawalRequest,
} = require("../services/admin-notification-service");
const { createWithdrawalRequest } = require("../services/withdrawal-service");
const {
  PAGES,
  clearFlowState,
  getSessionState,
  goBack,
  resetNavigation,
} = require("../state/navigation");
const { formatMoney } = require("../utils/formatters");
const {
  isValidCardNumber,
  normalizeCardNumber,
} = require("../utils/card-number");
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

async function finalizeWithdrawalRequest(ctx, user, amount, cardNumber) {
  const locale = getUserLocale(user);
  const sessionState = getSessionState(ctx);

  resetNavigation(sessionState, PAGES.MAIN_MENU);

  const withdrawalRequest = await createWithdrawalRequest(user, cardNumber, amount);

  await ctx.reply(
    t(locale, "withdrawalCreated"),
    getMainMenuKeyboard(locale),
  );

  try {
    await notifyAdminsAboutWithdrawalRequest(
      user,
      withdrawalRequest,
    );
  } catch (error) {
    console.error("Adminlarga withdrawal notification yuborilmadi:", error);
  }
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
  const locale = getUserLocale(user);

  if (sessionState.step === "awaiting_first_name") {
    try {
      await setUserEnteredFirstName(user, text);
    } catch {
      await ctx.reply(t(locale, "invalidFirstName"));
      await promptForFirstName(ctx, user, { replace: true });
      return;
    }

    await promptForLastName(ctx, user, { replace: true });
    return;
  }

  if (sessionState.step === "awaiting_last_name") {
    try {
      await setUserEnteredLastName(user, text);
    } catch {
      await ctx.reply(t(locale, "invalidLastName"));
      await promptForLastName(ctx, user, { replace: true });
      return;
    }

    await promptForPhone(ctx, user, { replace: true });
    return;
  }

  if (selectedLocale && canHandleLanguageSelection(sessionState, user)) {
    await applyLanguageSelection(ctx, user, selectedLocale);
    return;
  }

  if (!hasSelectedLanguage(user)) {
    await promptForLanguage(ctx, { replace: true });
    return;
  }

  if (!hasEnteredFirstName(user)) {
    try {
      await setUserEnteredFirstName(user, text);
    } catch {
      await ctx.reply(t(locale, "invalidFirstName"));
      await promptForFirstName(ctx, user, { replace: true });
      return;
    }

    await promptForLastName(ctx, user, { replace: true });
    return;
  }

  if (!hasEnteredLastName(user)) {
    try {
      await setUserEnteredLastName(user, text);
    } catch {
      await ctx.reply(t(locale, "invalidLastName"));
      await promptForLastName(ctx, user, { replace: true });
      return;
    }

    await promptForPhone(ctx, user, { replace: true });
    return;
  }

  if (!hasPhoneNumber(user)) {
    await ctx.reply(
      t(locale, "contactRequestOnly"),
      getContactKeyboard(locale),
    );
    return;
  }

  if (!isUserApproved(user)) {
    if (isAwaitingRegistrationPhoto(user)) {
      await promptForRegistrationPhoto(ctx, user, { replace: true });
      return;
    }

    if (isPendingRegistrationApproval(user)) {
      await showPendingApprovalMessage(ctx, user, { replace: true });
      return;
    }
  }

  if (
    text === t(locale, "back") &&
    sessionState.step === "awaiting_card_confirmation"
  ) {
    const previousPage = goBack(
      sessionState,
      sessionState.cardFlowType === "settings"
        ? PAGES.SETTINGS_CARD
        : PAGES.WITHDRAWAL_CARD,
    );
    sessionState.pendingWithdrawalCard = null;
    await renderPage(ctx, user, previousPage, { replace: true });
    return;
  }

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

  if (text === t(locale, "changeCardNumber")) {
    await askSettingsCard(ctx, user);
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

    if (hasSavedWithdrawalCard(user)) {
      await finalizeWithdrawalRequest(
        ctx,
        user,
        amount,
        getSavedWithdrawalCard(user),
      );
      return;
    }

    await askWithdrawalCard(ctx, user, amount);
    return;
  }

  if (sessionState.step === "awaiting_card_input") {
    const cardNumber = normalizeCardNumber(text);
    const isSettingsFlow = sessionState.cardFlowType === "settings";
    const amount = Number(sessionState.withdrawalAmount || 0);

    if (!isSettingsFlow && !amount) {
      await ctx.reply(
        t(locale, "invalidWithdrawalAmount"),
        getBackKeyboard(locale),
      );
      return;
    }

    if (!isValidCardNumber(cardNumber)) {
      await ctx.reply(
        t(locale, "invalidCardNumber"),
        getBackKeyboard(locale),
      );
      return;
    }

    await confirmCardEntry(
      ctx,
      user,
      isSettingsFlow ? "settings" : "withdrawal",
      cardNumber,
    );
    return;
  }

  if (sessionState.step === "awaiting_card_confirmation") {
    const isSettingsFlow = sessionState.cardFlowType === "settings";
    const cardNumber = normalizeCardNumber(text);

    if (isValidCardNumber(cardNumber)) {
      await confirmCardEntry(
        ctx,
        user,
        isSettingsFlow ? "settings" : "withdrawal",
        cardNumber,
        { replace: true },
      );
      return;
    }

    await ctx.reply(
      t(locale, "invalidCardNumber"),
      getBackKeyboard(locale),
    );
    return;
  }

  await ctx.reply(
    t(locale, "unknownMenuAction"),
    getMainMenuKeyboard(locale),
  );
}

module.exports = handleText;
