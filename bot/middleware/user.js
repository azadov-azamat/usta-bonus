const {
  promptForLanguage,
  promptForPhone,
} = require("../services/menu-service");
const {
  ensureTelegramUser,
  hasPhoneNumber,
  hasSelectedLanguage,
} = require("../services/user-service");
const { resolveLocaleFromText } = require("../utils/locale");

function isStartCommand(ctx) {
  const text = String(ctx.message?.text || "").trim();
  return /^\/start(?:@\w+)?(?:\s|$)/.test(text);
}

function isHelpCommand(ctx) {
  const text = String(ctx.message?.text || "").trim();
  return /^\/help(?:@\w+)?(?:\s|$)/.test(text);
}

async function userMiddleware(ctx, next) {
  if (!ctx.from) {
    return next();
  }

  const user = await ensureTelegramUser(ctx);
  const selectedLocale = resolveLocaleFromText(ctx.message?.text);

  ctx.state = ctx.state || {};
  ctx.state.user = user;
  ctx.state.selectedLocale = selectedLocale;

  if (isStartCommand(ctx) || isHelpCommand(ctx)) {
    return next();
  }

  if (!hasSelectedLanguage(user) && !selectedLocale) {
    await promptForLanguage(ctx, { replace: true });
    return;
  }

  if (!hasPhoneNumber(user) && !ctx.message?.contact && !selectedLocale) {
    await promptForPhone(ctx, user, { replace: true });
    return;
  }

  return next();
}

module.exports = {
  userMiddleware,
};
