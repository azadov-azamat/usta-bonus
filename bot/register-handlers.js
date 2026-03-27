const handleContact = require("./handlers/contact");
const handleHelp = require("./handlers/help");
const {
  handlePromoMore,
  PROMO_MORE_ACTION_REGEX,
} = require("./handlers/promo-more");
const handleStart = require("./handlers/start");
const handleText = require("./handlers/text");

function registerBotHandlers(bot) {
  bot.start(handleStart);
  bot.help(handleHelp);
  bot.action(PROMO_MORE_ACTION_REGEX, handlePromoMore);
  bot.on("contact", handleContact);
  bot.on("text", handleText);
}

module.exports = {
  registerBotHandlers,
};
