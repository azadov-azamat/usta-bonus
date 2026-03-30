const { t } = require("../i18n");
const { getContactKeyboard } = require("../keyboards");
const {
  promptForFirstName,
  promptForLastName,
  promptForLanguage,
  promptForRegistrationPhoto,
} = require("../services/menu-service");
const {
  hasEnteredFirstName,
  hasEnteredLastName,
  hasSelectedLanguage,
  setUserPhoneNumber,
} = require("../services/user-service");
const { getSessionState, resetNavigation } = require("../state/navigation");
const { getUserLocale } = require("../utils/locale");

async function handleContact(ctx) {
  const user = ctx.state.user;
  const locale = getUserLocale(user);

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

  if (
    ctx.message.contact.user_id &&
    ctx.message.contact.user_id !== ctx.from.id
  ) {
    await ctx.reply(
      t(locale, "requestOwnContact"),
      getContactKeyboard(locale),
    );
    return;
  }

  await setUserPhoneNumber(user, ctx.message.contact.phone_number);
  resetNavigation(getSessionState(ctx));
  await promptForRegistrationPhoto(ctx, user, { replace: true });
}

module.exports = handleContact;
