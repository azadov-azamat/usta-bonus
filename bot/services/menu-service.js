const { t } = require("../i18n");
const {
  getBackKeyboard,
  getContactKeyboard,
  getLanguageKeyboard,
  getMainMenuKeyboard,
  getPromoCodeCopyKeyboard,
} = require("../keyboards");
const {
  PAGES,
  clearFlowState,
  getSessionState,
  setCurrentPage,
} = require("../state/navigation");
const { formatMoney, formatMoneyWithUnit } = require("../utils/formatters");
const { getUserLocale } = require("../utils/locale");
const { listUserPromoCodes } = require("./promo-service");

async function promptForLanguage(ctx, options = {}) {
  const sessionState = getSessionState(ctx);
  setCurrentPage(sessionState, PAGES.LANGUAGE, options);
  await ctx.reply(
    "Tilni tanlang / Выберите язык / Тилни танланг.",
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

  const codes = await listUserPromoCodes(user.id);

  if (!codes.length) {
    await ctx.reply(
      t(locale, "myPromoCodesEmpty"),
      getBackKeyboard(locale),
    );
    return;
  }

  await ctx.reply(
    `${t(locale, "myPromoCodesTitle")}\n${t(locale, "myPromoCodesCopyHint")}`,
    getBackKeyboard(locale),
  );

  const lines = codes.map((code, index) => {
    const productName = code.product?.name || "-";
    const amount = formatMoneyWithUnit(
      locale,
      code.product?.bonusAmount || 0,
    );

    return [
      `${index + 1}. ${t(locale, "productLabel")}: ${productName}`,
      `${t(locale, "priceLabel")}: ${amount}`,
    ].join("\n");
  });

  await ctx.reply(
    lines.join("\n\n"),
    getPromoCodeCopyKeyboard(codes),
  );
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
    t(locale, "enterWithdrawalAmount"),
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
  askPromoCode,
  askWithdrawalAmount,
  askWithdrawalCard,
  listMyPromoCodes,
  promptForLanguage,
  promptForPhone,
  renderPage,
  showBalance,
  showMainMenu,
};
