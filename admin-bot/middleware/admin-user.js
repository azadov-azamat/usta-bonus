const { User } = require("../../models");
const { setAdminChatId } = require("../../bot/services/user-service");

async function adminUserMiddleware(ctx, next) {
  if (!ctx.from) {
    return next();
  }

  const accessDeniedMessage =
    "Sizda admin huquqi yo'q yoki akkauntingiz bazada topilmadi.";
  const telegramId = String(ctx.from.id);
  const adminUser = await User.findOne({
    where: {
      telegramId,
      role: "admin",
    },
  });

  ctx.state = ctx.state || {};
  ctx.state.adminUser = adminUser || null;

  if (!adminUser) {
    if (ctx.callbackQuery?.id) {
      await ctx.answerCbQuery(accessDeniedMessage, { show_alert: true });
      return;
    }

    if (ctx.chat?.id) {
      await ctx.reply(accessDeniedMessage);
      return;
    }
  }

  await setAdminChatId(
    adminUser,
    ctx.chat?.id ? String(ctx.chat.id) : null,
  );

  return next();
}

module.exports = {
  adminUserMiddleware,
};
