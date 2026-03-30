async function sendTelegramChatAction(telegram, chatId, action = "typing") {
  if (!telegram || !chatId) {
    return;
  }

  try {
    await telegram.sendChatAction(chatId, action);
  } catch {}
}

function resolveCtxChatId(ctx) {
  return (
    ctx.chat?.id ||
    ctx.callbackQuery?.message?.chat?.id ||
    null
  );
}

async function sendCtxChatAction(ctx, action = "typing") {
  return sendTelegramChatAction(
    ctx?.telegram,
    resolveCtxChatId(ctx),
    action,
  );
}

module.exports = {
  resolveCtxChatId,
  sendCtxChatAction,
  sendTelegramChatAction,
};
