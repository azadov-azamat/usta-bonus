const handleContact = require("./handlers/contact");
const handleHelp = require("./handlers/help");
const {
  BACK_ACTION,
  handleLanguageAction,
  handleMenuBackAction,
  handleSettingsLanguageAction,
  LANGUAGE_ACTION_REGEX,
  SETTINGS_LANGUAGE_ACTION,
} = require("./handlers/menu-actions");
const {
  handlePromoMore,
  PROMO_MORE_ACTION_REGEX,
} = require("./handlers/promo-more");
const handleStart = require("./handlers/start");
const handleText = require("./handlers/text");

function registerBotHandlers(bot) {
  bot.start(handleStart);
  bot.help(handleHelp);
  bot.action(SETTINGS_LANGUAGE_ACTION, handleSettingsLanguageAction);
  bot.action(BACK_ACTION, handleMenuBackAction);
  bot.action(LANGUAGE_ACTION_REGEX, handleLanguageAction);
  bot.action(PROMO_MORE_ACTION_REGEX, handlePromoMore);
  bot.on("contact", handleContact);
  bot.on("text", handleText);
}

module.exports = {
  registerBotHandlers,
};
