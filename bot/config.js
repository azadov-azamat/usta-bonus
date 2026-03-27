const token = process.env.BOT_TOKEN;
const webhookPath = process.env.BOT_WEBHOOK_PATH || "/telegram/webhook";

function getExpectedWebhookUrl() {
  if (!process.env.BOT_BASE_URL) {
    return null;
  }

  return new URL(webhookPath, process.env.BOT_BASE_URL).toString();
}

function getWebhookPath() {
  return webhookPath;
}

function getWebhookUrl() {
  return getExpectedWebhookUrl();
}

module.exports = {
  token,
  getExpectedWebhookUrl,
  getWebhookPath,
  getWebhookUrl,
};
