const { getSessionState, resetNavigation } = require("../state/navigation");
const {
  promptForFirstName,
  promptForLastName,
  promptForLanguage,
  promptForPhone,
  promptForRegistrationPhoto,
  showPendingApprovalMessage,
  showMainMenu,
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

async function handleStart(ctx) {
  const user = ctx.state.user;
  const sessionState = getSessionState(ctx);

  resetNavigation(sessionState);

  if (!hasSelectedLanguage(user)) {
    await promptForLanguage(ctx, { replace: true });
    return;
  }

  if (!hasEnteredFirstName(user)) {
    await promptForFirstName(ctx, user, { replace: true });
    return;
  }

  if (!hasEnteredLastName(user)) {
    await promptForLastName(ctx, user, { replace: true });
    return;
  }

  if (!hasPhoneNumber(user)) {
    await promptForPhone(ctx, user, { replace: true });
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

  await showMainMenu(ctx, user, "mainMenuHint", { replace: true });
}

module.exports = handleStart;
