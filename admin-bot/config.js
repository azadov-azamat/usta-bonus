const token = String(process.env.ADMIN_BOT_TOKEN || "").trim();
const webhookPath =
  process.env.ADMIN_BOT_WEBHOOK_PATH || "/telegram/admin-webhook";

function getBaseUrl() {
  return process.env.ADMIN_BOT_BASE_URL || process.env.BOT_BASE_URL || null;
}

function getExpectedWebhookUrl() {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    return null;
  }

  return new URL(webhookPath, baseUrl).toString();
}

function getWebhookPath() {
  return webhookPath;
}

function getWebhookUrl() {
  return getExpectedWebhookUrl();
}

function hasAdminBotToken() {
  return Boolean(token);
}

module.exports = {
  getExpectedWebhookUrl,
  getWebhookPath,
  getWebhookUrl,
  hasAdminBotToken,
  token,
};
