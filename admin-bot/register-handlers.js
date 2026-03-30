const handleAdminHelp = require("./handlers/help");
const {
  handleRegistrationDecision,
  REGISTRATION_ACTION_REGEX,
} = require("./handlers/registration-actions");
const handleAdminStart = require("./handlers/start");
const handleAdminText = require("./handlers/text");

function registerAdminBotHandlers(bot) {
  bot.start(handleAdminStart);
  bot.help(handleAdminHelp);
  bot.action(REGISTRATION_ACTION_REGEX, handleRegistrationDecision);
  bot.on("text", handleAdminText);
}

module.exports = {
  registerAdminBotHandlers,
};
