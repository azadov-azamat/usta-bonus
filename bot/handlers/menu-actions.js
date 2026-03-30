const {
  createWithdrawalRequest,
} = require("../services/withdrawal-service");
const {
  applyLanguageSelection,
  renderPage,
  showLanguageSettings,
  showSettingsMenu,
} = require("../services/menu-service");
const {
  notifyAdminsAboutWithdrawalRequest,
} = require("../services/admin-notification-service");
const {
  setUserWithdrawalCard,
} = require("../services/user-service");
const {
  PAGES,
  clearFlowState,
  getSessionState,
  goBack,
  resetNavigation,
} = require("../state/navigation");
const { t } = require("../i18n");
const { getMainMenuKeyboard } = require("../keyboards");
const { sendCtxChatAction } = require("../utils/chat-actions");
const { getUserLocale } = require("../utils/locale");
const {
  BACK_ACTION,
  CONFIRM_CARD_ACTION_REGEX,
  LANGUAGE_ACTION_REGEX,
  resolveConfirmCardAction,
  resolveLocaleFromAction,
  SETTINGS_LANGUAGE_ACTION,
} = require("../utils/menu-actions");

async function handleSettingsLanguageAction(ctx) {
  await ctx.answerCbQuery();
  await sendCtxChatAction(ctx, "typing");
  await showLanguageSettings(ctx, ctx.state.user);
}

async function handleMenuBackAction(ctx) {
  const sessionState = getSessionState(ctx);

  clearFlowState(sessionState);

  await ctx.answerCbQuery();

  const previousPage = goBack(sessionState, PAGES.MAIN_MENU);
  await sendCtxChatAction(ctx, "typing");
  await renderPage(ctx, ctx.state.user, previousPage, { replace: true });
}

async function handleLanguageAction(ctx) {
  const locale = resolveLocaleFromAction(ctx.callbackQuery?.data);

  await ctx.answerCbQuery();

  if (!locale) {
    return;
  }

  await sendCtxChatAction(ctx, "typing");
  await applyLanguageSelection(ctx, ctx.state.user, locale);
}

async function handleConfirmCardAction(ctx) {
  const action = resolveConfirmCardAction(ctx.callbackQuery?.data);
  const sessionState = getSessionState(ctx);
  const user = ctx.state.user;
  const locale = getUserLocale(user);

  await ctx.answerCbQuery();

  if (
    !action ||
    sessionState.step !== "awaiting_card_confirmation" ||
    action.flowType !== sessionState.cardFlowType
  ) {
    return;
  }

  try {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  } catch {}

  await setUserWithdrawalCard(user, action.cardNumber);

  if (action.flowType === "settings") {
    resetNavigation(sessionState, PAGES.SETTINGS);
    await showSettingsMenu(ctx, user, "cardSaved", { replace: true });
    return;
  }

  const amount = Number(sessionState.withdrawalAmount || 0);

  if (!amount) {
    await renderPage(ctx, user, PAGES.WITHDRAWAL_AMOUNT, { replace: true });
    return;
  }

  resetNavigation(sessionState, PAGES.MAIN_MENU);

  const withdrawalRequest = await createWithdrawalRequest(
    user,
    action.cardNumber,
    amount,
  );

  await sendCtxChatAction(ctx, "typing");
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

module.exports = {
  BACK_ACTION,
  CONFIRM_CARD_ACTION_REGEX,
  handleConfirmCardAction,
  handleLanguageAction,
  handleMenuBackAction,
  handleSettingsLanguageAction,
  LANGUAGE_ACTION_REGEX,
  SETTINGS_LANGUAGE_ACTION,
};
