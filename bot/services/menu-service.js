const { t } = require("../i18n");
const {
  getBackKeyboard,
  getContactKeyboard,
  getLanguageKeyboard,
  getMainMenuKeyboard,
  getPromoCodeKeyboard,
  getSettingsKeyboard,
} = require("../keyboards");
const {
  PAGES,
  clearFlowState,
  getSessionState,
  goBack,
  resetNavigation,
  setCurrentPage,
} = require("../state/navigation");
const { formatMoney, formatMoneyWithUnit } = require("../utils/formatters");
const { getUserLocale } = require("../utils/locale");
const { listUserPromoCodesPage } = require("./promo-service");
const { hasPhoneNumber, setUserLanguage } = require("./user-service");
const PROMO_MORE_ACTION_REGEX = /^promo_more:(\d+)$/;

function getPromoMoreAction(offset) {
  return `promo_more:${offset}`;
}

function getPromoCodeMessageText(locale, promoCode, index) {
  const productName = promoCode.product?.name || "-";
  const amount = formatMoneyWithUnit(
    locale,
    promoCode.product?.bonusAmount || 0,
  );

  return [
    `${index + 1}. ${t(locale, "productLabel")}: ${productName}`,
    `${t(locale, "priceLabel")}: ${amount}`,
  ].join("\n");
}

function getVisibleRowsWithoutCallback(message, callbackData) {
  const inlineKeyboard = message?.reply_markup?.inline_keyboard;

  if (!Array.isArray(inlineKeyboard)) {
    return null;
  }

  return inlineKeyboard
    .map((row) =>
      row.filter(
        (button) =>
          !button.callback_data || button.callback_data !== callbackData,
      ),
    )
    .filter((row) => row.length > 0);
}

async function sendPromoCodesPage(ctx, user, offset = 0, options = {}) {
  const locale = getUserLocale(user);
  const { showHeader = false } = options;
  const { items, nextOffset } = await listUserPromoCodesPage(user.id, offset);

  if (!items.length) {
    return false;
  }

  if (showHeader) {
    await ctx.reply(
      t(locale, "myPromoCodesTitle"),
      getBackKeyboard(locale),
    );
  }

  for (const [index, promoCode] of items.entries()) {
    const absoluteIndex = offset + index;
    const isLastVisibleCode = index === items.length - 1;

    await ctx.reply(
      getPromoCodeMessageText(locale, promoCode, absoluteIndex),
      getPromoCodeKeyboard(locale, promoCode.code, absoluteIndex, {
        showMoreCallbackData:
          isLastVisibleCode && nextOffset !== null
            ? getPromoMoreAction(nextOffset)
            : null,
      }),
    );
  }

  return true;
}

async function promptForLanguage(ctx, options = {}) {
  const sessionState = getSessionState(ctx);
  clearFlowState(sessionState);
  setCurrentPage(sessionState, PAGES.LANGUAGE, options);
  await ctx.reply(
    "🌐 Tilni tanlang / Выберите язык / Тилни танланг.",
    getLanguageKeyboard(),
  );
}

async function promptForPhone(ctx, user, options = {}) {
  const sessionState = getSessionState(ctx);
  const locale = getUserLocale(user);
  setCurrentPage(sessionState, PAGES.CONTACT, options);
  await ctx.reply(
    t(locale, "sharePhone"),
    getContactKeyboard(locale),
  );
}

async function showMainMenu(
  ctx,
  user,
  messageKey = "mainMenuHint",
  options = {},
) {
  const sessionState = getSessionState(ctx);
  const locale = getUserLocale(user);
  clearFlowState(sessionState);
  setCurrentPage(sessionState, PAGES.MAIN_MENU, options);
  await ctx.reply(
    t(locale, messageKey),
    getMainMenuKeyboard(locale),
  );
}

async function showSettingsMenu(
  ctx,
  user,
  messageKey = "settingsHint",
  options = {},
) {
  const sessionState = getSessionState(ctx);
  const locale = getUserLocale(user);
  clearFlowState(sessionState);
  setCurrentPage(sessionState, PAGES.SETTINGS, options);
  await ctx.reply(
    t(locale, messageKey),
    getSettingsKeyboard(locale),
  );
}

async function showLanguageSettings(ctx, user, options = {}) {
  const sessionState = getSessionState(ctx);
  const locale = getUserLocale(user);
  clearFlowState(sessionState);
  setCurrentPage(sessionState, PAGES.SETTINGS_LANGUAGE, options);
  await ctx.reply(
    t(locale, "chooseLanguage"),
    getLanguageKeyboard(locale, { showBack: true }),
  );
}

async function applyLanguageSelection(ctx, user, selectedLocale) {
  const sessionState = getSessionState(ctx);
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

    if (ctx.callbackQuery?.message) {
      try {
        await ctx.editMessageText(t(selectedLocale, "languageSaved"));
      } catch {}
    }

    await ctx.reply(
      t(selectedLocale, "languageSaved"),
      getMainMenuKeyboard(selectedLocale),
    );
    return;
  }

  if (ctx.callbackQuery?.message) {
    try {
      await ctx.editMessageText(t(selectedLocale, "languageSaved"));
    } catch {}
  } else {
    await ctx.reply(t(selectedLocale, "languageSaved"));
  }

  await promptForPhone(ctx, user, { replace: true });
}

async function askPromoCode(ctx, user, options = {}) {
  const sessionState = getSessionState(ctx);
  const locale = getUserLocale(user);
  sessionState.step = "awaiting_promo_code";
  setCurrentPage(sessionState, PAGES.PROMO_INPUT, options);
  await ctx.reply(
    t(locale, "enterPromoCode"),
    getBackKeyboard(locale),
  );
}

async function listMyPromoCodes(ctx, user, options = {}) {
  const sessionState = getSessionState(ctx);
  const locale = getUserLocale(user);
  clearFlowState(sessionState);
  setCurrentPage(sessionState, PAGES.PROMO_LIST, options);

  const hasCodes = await sendPromoCodesPage(ctx, user, 0, {
    showHeader: true,
  });

  if (!hasCodes) {
    await ctx.reply(
      t(locale, "myPromoCodesEmpty"),
      getBackKeyboard(locale),
    );
  }
}

async function showMorePromoCodes(ctx, user, offset) {
  const sessionState = getSessionState(ctx);
  const locale = getUserLocale(user);
  const callbackData = getPromoMoreAction(offset);
  const visibleRows = getVisibleRowsWithoutCallback(
    ctx.callbackQuery?.message,
    callbackData,
  );
  const { items } = await listUserPromoCodesPage(user.id, offset);

  clearFlowState(sessionState);
  setCurrentPage(sessionState, PAGES.PROMO_LIST, { replace: true });

  if (!items.length) {
    await ctx.answerCbQuery(t(locale, "allPromoCodesShown"));
    return;
  }

  await ctx.answerCbQuery();

  if (visibleRows) {
    try {
      await ctx.editMessageReplyMarkup({
        inline_keyboard: visibleRows,
      });
    } catch {}
  }

  await sendPromoCodesPage(ctx, user, offset);
}

async function showBalance(ctx, user, options = {}) {
  const sessionState = getSessionState(ctx);
  const locale = getUserLocale(user);
  clearFlowState(sessionState);
  setCurrentPage(sessionState, PAGES.BALANCE, options);

  await ctx.reply(
    t(locale, "balanceText", {
      amount: formatMoney(locale, user.balance),
    }),
    getBackKeyboard(locale),
  );
}

async function askWithdrawalAmount(ctx, user, options = {}) {
  const sessionState = getSessionState(ctx);
  const locale = getUserLocale(user);
  sessionState.step = "awaiting_withdrawal_amount";
  setCurrentPage(sessionState, PAGES.WITHDRAWAL_AMOUNT, options);
  await ctx.reply(
    t(locale, "enterWithdrawalAmount", {
      amount: formatMoney(locale, user.balance),
    }),
    getBackKeyboard(locale),
  );
}

async function askWithdrawalCard(ctx, user, amount, options = {}) {
  const sessionState = getSessionState(ctx);
  const locale = getUserLocale(user);
  sessionState.step = "awaiting_withdrawal_card";
  sessionState.withdrawalAmount = amount;
  setCurrentPage(sessionState, PAGES.WITHDRAWAL_CARD, options);
  await ctx.reply(
    t(locale, "enterCardNumber"),
    getBackKeyboard(locale),
  );
}

async function renderPage(ctx, user, page, options = {}) {
  switch (page) {
    case PAGES.LANGUAGE:
      await promptForLanguage(ctx, options);
      break;
    case PAGES.CONTACT:
      await promptForPhone(ctx, user, options);
      break;
    case PAGES.SETTINGS:
      await showSettingsMenu(ctx, user, "settingsHint", options);
      break;
    case PAGES.SETTINGS_LANGUAGE:
      await showLanguageSettings(ctx, user, options);
      break;
    case PAGES.PROMO_INPUT:
      await askPromoCode(ctx, user, options);
      break;
    case PAGES.PROMO_LIST:
      await listMyPromoCodes(ctx, user, options);
      break;
    case PAGES.BALANCE:
      await showBalance(ctx, user, options);
      break;
    case PAGES.WITHDRAWAL_AMOUNT:
      await askWithdrawalAmount(ctx, user, options);
      break;
    case PAGES.WITHDRAWAL_CARD:
      await askWithdrawalCard(
        ctx,
        user,
        getSessionState(ctx).withdrawalAmount || 0,
        options,
      );
      break;
    case PAGES.MAIN_MENU:
    default:
      await showMainMenu(ctx, user, "mainMenuHint", options);
      break;
  }
}

module.exports = {
  applyLanguageSelection,
  askPromoCode,
  askWithdrawalAmount,
  askWithdrawalCard,
  listMyPromoCodes,
  promptForLanguage,
  promptForPhone,
  renderPage,
  PROMO_MORE_ACTION_REGEX,
  showBalance,
  showLanguageSettings,
  showMorePromoCodes,
  showMainMenu,
  showSettingsMenu,
};
