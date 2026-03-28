const {
  applyLanguageSelection,
  renderPage,
  showLanguageSettings,
} = require("../services/menu-service");
const {
  PAGES,
  clearFlowState,
  getSessionState,
  goBack,
} = require("../state/navigation");
const {
  BACK_ACTION,
  LANGUAGE_ACTION_REGEX,
  resolveLocaleFromAction,
  SETTINGS_LANGUAGE_ACTION,
} = require("../utils/menu-actions");

async function handleSettingsLanguageAction(ctx) {
  await ctx.answerCbQuery();
  await showLanguageSettings(ctx, ctx.state.user);
}

async function handleMenuBackAction(ctx) {
  const sessionState = getSessionState(ctx);

  clearFlowState(sessionState);

  await ctx.answerCbQuery();

  const previousPage = goBack(sessionState, PAGES.MAIN_MENU);
  await renderPage(ctx, ctx.state.user, previousPage, { replace: true });
}

async function handleLanguageAction(ctx) {
  const locale = resolveLocaleFromAction(ctx.callbackQuery?.data);

  await ctx.answerCbQuery();

  if (!locale) {
    return;
  }

  await applyLanguageSelection(ctx, ctx.state.user, locale);
}

module.exports = {
  BACK_ACTION,
  handleLanguageAction,
  handleMenuBackAction,
  handleSettingsLanguageAction,
  LANGUAGE_ACTION_REGEX,
  SETTINGS_LANGUAGE_ACTION,
};
