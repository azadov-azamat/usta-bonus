const handleContact = require("./handlers/contact");
const handleStart = require("./handlers/start");
const handleText = require("./handlers/text");

function registerBotHandlers(bot) {
  bot.start(handleStart);
  bot.on("contact", handleContact);
  bot.on("text", handleText);
}

module.exports = {
  registerBotHandlers,
};
