const {
  promptForFirstName,
  promptForLastName,
  promptForLanguage,
  promptForPhone,
  promptForRegistrationPhoto,
  showPendingApprovalMessage,
} = require("../services/menu-service");
const {
  ensureTelegramUser,
  hasEnteredFirstName,
  hasEnteredLastName,
  hasPhoneNumber,
  hasSelectedLanguage,
  isAwaitingRegistrationPhoto,
  isPendingRegistrationApproval,
  isUserApproved,
} = require("../services/user-service");
const { getSessionState } = require("../state/navigation");
const { resolveLocaleFromText } = require("../utils/locale");

function isStartCommand(ctx) {
  const text = String(ctx.message?.text || "").trim();
  return /^\/start(?:@\w+)?(?:\s|$)/.test(text);
}

function isHelpCommand(ctx) {
  const text = String(ctx.message?.text || "").trim();
  return /^\/help(?:@\w+)?(?:\s|$)/.test(text);
}

function isPrivacyCommand(ctx) {
  const text = String(ctx.message?.text || "").trim();
  return /^\/privacy(?:@\w+)?(?:\s|$)/.test(text);
}

function hasRegistrationImage(ctx) {
  if (Array.isArray(ctx.message?.photo) && ctx.message.photo.length > 0) {
    return true;
  }

  return String(ctx.message?.document?.mime_type || "").startsWith("image/");
}

async function userMiddleware(ctx, next) {
  if (!ctx.from) {
    return next();
  }

  const user = await ensureTelegramUser(ctx);
  const sessionState = getSessionState(ctx);
  const selectedLocale = resolveLocaleFromText(ctx.message?.text);

  ctx.state = ctx.state || {};
  ctx.state.user = user;
  ctx.state.selectedLocale = selectedLocale;

  if (isStartCommand(ctx) || isHelpCommand(ctx) || isPrivacyCommand(ctx)) {
    return next();
  }

  if (ctx.callbackQuery?.data) {
    return next();
  }

  if (
    ctx.message?.text &&
    (sessionState.step === "awaiting_first_name" ||
      sessionState.step === "awaiting_last_name")
  ) {
    return next();
  }

  if (!hasSelectedLanguage(user) && !selectedLocale) {
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

  if (!hasPhoneNumber(user) && !ctx.message?.contact && !selectedLocale) {
    await promptForPhone(ctx, user, { replace: true });
    return;
  }

  if (!isUserApproved(user)) {
    if (isAwaitingRegistrationPhoto(user)) {
      if (hasRegistrationImage(ctx)) {
        return next();
      }

      await promptForRegistrationPhoto(ctx, user, { replace: true });
      return;
    }

    if (isPendingRegistrationApproval(user)) {
      await showPendingApprovalMessage(ctx, user, { replace: true });
      return;
    }
  }

  return next();
}

module.exports = {
  userMiddleware,
};
