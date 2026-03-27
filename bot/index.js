require("dotenv").config();

const { randomBytes } = require("node:crypto");
const { Telegraf, session } = require("telegraf");
const {
  token,
  getExpectedWebhookUrl,
  getWebhookPath,
  getWebhookUrl,
} = require("./config");
const { t } = require("./i18n");
const { userMiddleware } = require("./middleware/user");
const { registerBotHandlers } = require("./register-handlers");
const { formatMoney } = require("./utils/formatters");

if (!token) {
  throw new Error("BOT_TOKEN topilmadi. .env faylga token yozing.");
}

const bot = new Telegraf(token);
const runtimeState = {
  started: false,
  mode: "stopped",
};

bot.use(session());
bot.use(userMiddleware);
registerBotHandlers(bot);

bot.catch((error) => {
  const traceId = randomBytes(4).toString("hex");
  console.error(`Bot xatoligi [${traceId}]:`, error);
});

async function startBotRuntime() {
  await bot.telegram.setMyCommands([
    { command: "start", description: "Botni ishga tushirish" },
    { command: "help", description: "Yordam" },
  ]);

  if (runtimeState.started) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    const webhookUrl = getExpectedWebhookUrl();

    if (!webhookUrl) {
      throw new Error("Production uchun BOT_BASE_URL ko'rsatilishi kerak.");
    }

    await bot.telegram.setWebhook(webhookUrl);
    runtimeState.started = true;
    runtimeState.mode = "webhook";
    console.log(`Telegram webhook o'rnatildi: ${webhookUrl}`);
    return;
  }

  await bot.telegram.deleteWebhook({
    drop_pending_updates: true,
  });
  await bot.launch({
    dropPendingUpdates: true,
  });
  runtimeState.started = true;
  runtimeState.mode = "polling";
  console.log("Telegram polling ishga tushdi.");
}

async function stopBotRuntime(reason = "shutdown") {
  if (!runtimeState.started) {
    return;
  }

  bot.stop(reason);

  if (runtimeState.mode === "webhook") {
    try {
      await bot.telegram.deleteWebhook({
        drop_pending_updates: false,
      });
    } catch {}
  }

  runtimeState.started = false;
  runtimeState.mode = "stopped";
}

module.exports = {
  bot,
  formatMoney,
  getExpectedWebhookUrl,
  getWebhookPath,
  getWebhookUrl,
  startBotRuntime,
  stopBotRuntime,
  t,
};
