const { setAdminChatId } = require("../../bot/services/user-service");
const { sendCtxChatAction } = require("../../bot/utils/chat-actions");

async function handleAdminStart(ctx) {
  const adminUser = ctx.state.adminUser;

  if (!adminUser) {
    await sendCtxChatAction(ctx, "typing");
    await ctx.reply(
      "Bu bot faqat admin role biriktirilgan Telegram accountlar uchun ishlaydi.",
    );
    return;
  }

  await setAdminChatId(adminUser, ctx.chat?.id ? String(ctx.chat.id) : null);

  await sendCtxChatAction(ctx, "typing");
  await ctx.reply(
    "Admin bot tayyor. Registratsiya tasdiqlashlari va to'lov arizalari shu yerga yuboriladi.",
  );
}

module.exports = handleAdminStart;
