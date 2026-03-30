const { sendCtxChatAction } = require("../../bot/utils/chat-actions");

async function handleAdminHelp(ctx) {
  await sendCtxChatAction(ctx, "typing");
  await ctx.reply(
    "Bu admin bot registratsiya tasdiqlash va to'lov arizalarini ko'rsatadi. /start bilan chatni ulang va inline tugmalar orqali qaror bering.",
  );
}

module.exports = handleAdminHelp;
