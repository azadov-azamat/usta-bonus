const {
  PROMO_MORE_ACTION_REGEX,
  showMorePromoCodes,
} = require("../services/menu-service");
const { sendCtxChatAction } = require("../utils/chat-actions");

async function handlePromoMore(ctx) {
  const user = ctx.state.user;
  const offset = Math.max(0, Number(ctx.match?.[1] || 0));

  await sendCtxChatAction(ctx, "typing");
  await showMorePromoCodes(ctx, user, offset);
}

module.exports = {
  handlePromoMore,
  PROMO_MORE_ACTION_REGEX,
};
