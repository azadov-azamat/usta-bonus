const { getSessionState, resetNavigation } = require("../state/navigation");
const {
  promptForLanguage,
  promptForPhone,
  showMainMenu,
} = require("../services/menu-service");
const {
  hasPhoneNumber,
  hasSelectedLanguage,
} = require("../services/user-service");

async function handleStart(ctx) {
  const user = ctx.state.user;
  const sessionState = getSessionState(ctx);

  resetNavigation(sessionState);

  if (!hasSelectedLanguage(user)) {
    await promptForLanguage(ctx, { replace: true });
    return;
  }

  if (!hasPhoneNumber(user)) {
    await promptForPhone(ctx, user, { replace: true });
    return;
  }

  await showMainMenu(ctx, user, "mainMenuHint", { replace: true });
}

module.exports = handleStart;
