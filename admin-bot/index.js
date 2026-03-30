require("dotenv").config();

const { randomBytes } = require("node:crypto");
const { Telegraf } = require("telegraf");
const {
  getExpectedWebhookUrl,
  getWebhookPath,
  getWebhookUrl,
  hasAdminBotToken,
  token,
} = require("./config");
const { adminUserMiddleware } = require("./middleware/admin-user");
const { registerAdminBotHandlers } = require("./register-handlers");

const runtimeState = {
  started: false,
  mode: "stopped",
};
let pollingLaunchPromise = null;

const adminBot = hasAdminBotToken() ? new Telegraf(token) : null;

if (adminBot) {
  adminBot.use(adminUserMiddleware);
  registerAdminBotHandlers(adminBot);

  adminBot.catch((error) => {
    const traceId = randomBytes(4).toString("hex");
    console.error(`Admin bot xatoligi [${traceId}]:`, error);
  });
}

function isAdminBotEnabled() {
  return Boolean(adminBot);
}

async function startAdminBotRuntime() {
  if (!adminBot) {
    console.warn("ADMIN_BOT_TOKEN topilmadi. Admin bot ishga tushirilmadi.");
    return;
  }

  const botInfo = await adminBot.telegram.getMe();
  console.log(`Admin bot ulandi: @${botInfo.username} (${botInfo.id})`);

  await adminBot.telegram.setMyCommands([
    { command: "start", description: "Admin botni ulash" },
    { command: "help", description: "Yordam" },
  ]);

  if (runtimeState.started) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    const webhookUrl = getExpectedWebhookUrl();

    if (!webhookUrl) {
      throw new Error(
        "Production uchun ADMIN_BOT_BASE_URL yoki BOT_BASE_URL ko'rsatilishi kerak.",
      );
    }

    await adminBot.telegram.setWebhook(webhookUrl);
    runtimeState.started = true;
    runtimeState.mode = "webhook";
    console.log(`Admin bot webhook o'rnatildi: ${webhookUrl}`);
    return;
  }

  await adminBot.telegram.deleteWebhook({
    drop_pending_updates: true,
  });
  pollingLaunchPromise = adminBot
    .launch({
      dropPendingUpdates: true,
    })
    .catch((error) => {
      console.error("Admin bot polling xatoligi:", error);
      throw error;
    });
  runtimeState.started = true;
  runtimeState.mode = "polling";
  console.log("Admin bot polling ishga tushdi.");
}

async function stopAdminBotRuntime(reason = "shutdown") {
  if (!adminBot || !runtimeState.started) {
    return;
  }

  adminBot.stop(reason);

  if (runtimeState.mode === "webhook") {
    try {
      await adminBot.telegram.deleteWebhook({
        drop_pending_updates: false,
      });
    } catch {}
  }

  runtimeState.started = false;
  runtimeState.mode = "stopped";
  pollingLaunchPromise = null;
}

module.exports = {
  adminBot,
  getAdminWebhookPath: getWebhookPath,
  getAdminWebhookUrl: getWebhookUrl,
  isAdminBotEnabled,
  startAdminBotRuntime,
  stopAdminBotRuntime,
};
