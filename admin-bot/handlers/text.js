const { sendCtxChatAction } = require("../../bot/utils/chat-actions");

async function handleAdminText(ctx) {
  await sendCtxChatAction(ctx, "typing");
  await ctx.reply(
    "Admin bot tayyor. Registratsiya so'rovlari va to'lov arizalari shu chatga keladi.",
  );
}

module.exports = handleAdminText;
