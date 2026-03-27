require("dotenv").config();

const { randomBytes } = require("node:crypto");
const { Telegraf, Markup, session } = require("telegraf");
const {
  sequelize,
  User,
  Product,
  PromoCode,
  WithdrawalRequest,
  BalanceTransaction,
} = require("../models");
const { getLanguageButtons, supportedLocales, t } = require("./i18n");
const {
  PAGES,
  clearFlowState,
  getSessionState,
  goBack,
  resetNavigation,
  setCurrentPage,
} = require("./navigation");

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN topilmadi. .env faylga token yozing.");
}

const bot = new Telegraf(token);
const webhookPath = process.env.BOT_WEBHOOK_PATH || "/telegram/webhook";
const runtimeState = {
  started: false,
  mode: "stopped",
};

bot.use(session());

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

function isSupportedLocale(locale) {
  return supportedLocales.includes(locale);
}

function formatMoney(locale, amount) {
  const language = locale === "ru" ? "ru-RU" : "uz-UZ";
  return new Intl.NumberFormat(language).format(Number(amount || 0));
}

function getMainMenu(locale) {
  return [
    [t(locale, "activatePromo"), t(locale, "myPromocodes")],
    [t(locale, "myBalance"), t(locale, "withdraw")],
  ];
}

function getBackMenu(locale) {
  return [[t(locale, "back")]];
}

function getLanguageKeyboard() {
  return Markup.keyboard(
    getLanguageButtons().map((item) => [item.label]),
  ).resize();
}

function getContactKeyboard(locale) {
  return Markup.keyboard([
    [Markup.button.contactRequest(t(locale, "contactButton"))],
  ]).resize();
}

function getMainMenuKeyboard(locale) {
  return Markup.keyboard(getMainMenu(locale)).resize();
}

function getBackKeyboard(locale) {
  return Markup.keyboard(getBackMenu(locale)).resize();
}

function resolveLocaleFromText(text) {
  const normalizedText = String(text || "").trim();
  const match = getLanguageButtons().find(
    (item) => item.label === normalizedText,
  );
  return match ? match.locale : null;
}

async function ensureUser(ctx) {
  const telegramId = String(ctx.from.id);
  const chatId = String(ctx.chat.id);

  const [user] = await User.findOrCreate({
    where: { telegramId },
    defaults: {
      role: "worker",
      telegramId,
      chatId,
      username: ctx.from.username || null,
      firstName: ctx.from.first_name || null,
      lastName: ctx.from.last_name || null,
    },
  });

  user.chatId = chatId;
  user.username = ctx.from.username || user.username;
  user.firstName = ctx.from.first_name || user.firstName;
  user.lastName = ctx.from.last_name || user.lastName;
  await user.save();

  return user;
}

async function askLanguage(ctx, options = {}) {
  const sessionState = getSessionState(ctx);
  setCurrentPage(sessionState, PAGES.LANGUAGE, options);
  await ctx.reply(
    "Tilni tanlang / Выберите язык / Тилни танланг.",
    getLanguageKeyboard(),
  );
}

async function askContact(ctx, user, options = {}) {
  const sessionState = getSessionState(ctx);
  setCurrentPage(sessionState, PAGES.CONTACT, options);
  await ctx.reply(
    t(user.language, "sharePhone"),
    getContactKeyboard(user.language),
  );
}

async function showMainMenu(
  ctx,
  user,
  messageKey = "mainMenuHint",
  options = {},
) {
  const sessionState = getSessionState(ctx);
  clearFlowState(sessionState);
  setCurrentPage(sessionState, PAGES.MAIN_MENU, options);
  await ctx.reply(
    t(user.language, messageKey),
    getMainMenuKeyboard(user.language),
  );
}

function normalizeCode(code) {
  return String(code || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function looksLikePromoCode(rawCode) {
  const code = normalizeCode(rawCode);

  if (code.length < 6) {
    return false;
  }

  if (code.startsWith("TRN-")) {
    return true;
  }

  return /^[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(code) && /[A-Z]/.test(code);
}

async function activatePromoCode(ctx, user, rawCode) {
  const code = normalizeCode(rawCode);

  if (!code) {
    await ctx.reply(
      t(user.language, "promoNotFound"),
      getMainMenuKeyboard(user.language),
    );
    return;
  }

  let activationResult = null;
  await sequelize.transaction(async (transaction) => {
    const promoCode = await PromoCode.findOne({
      where: { code },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!promoCode) {
      activationResult = {
        status: "not_found",
      };
      return;
    }

    if (promoCode.status === "activated") {
      activationResult = {
        status: "already_used",
      };
      return;
    }

    const product = await Product.findByPk(promoCode.productId, {
      transaction,
    });

    if (!product) {
      activationResult = {
        status: "not_found",
      };
      return;
    }

    const lockedUser = await User.findByPk(user.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const bonusAmount = Number(product.bonusAmount);
    const newBalance = Number(lockedUser.balance) + bonusAmount;

    await promoCode.update(
      {
        status: "activated",
        activatedAt: new Date(),
        activatedByUserId: user.id,
      },
      { transaction },
    );

    await lockedUser.update(
      {
        balance: newBalance,
      },
      { transaction },
    );

    await BalanceTransaction.create(
      {
        userId: user.id,
        type: "promo_activation",
        amount: product.bonusAmount,
        metadata: {
          promoCode: promoCode.code,
          productId: promoCode.productId,
          productName: product.name,
        },
      },
      { transaction },
    );

    activationResult = {
      status: "activated",
      bonusAmount,
    };
  });

  await user.reload();

  if (!activationResult || activationResult.status === "not_found") {
    await ctx.reply(
      t(user.language, "promoNotFound"),
      getMainMenuKeyboard(user.language),
    );
    return;
  }

  if (activationResult.status === "already_used") {
    await ctx.reply(
      t(user.language, "promoAlreadyUsed"),
      getMainMenuKeyboard(user.language),
    );
    return;
  }

  await ctx.reply(
    t(user.language, "promoActivated", {
      amount: formatMoney(user.language, activationResult.bonusAmount),
    }),
    getMainMenuKeyboard(user.language),
  );
}

async function listMyPromoCodes(ctx, user, options = {}) {
  const sessionState = getSessionState(ctx);
  clearFlowState(sessionState);
  setCurrentPage(sessionState, PAGES.PROMO_LIST, options);

  const codes = await PromoCode.findAll({
    where: { activatedByUserId: user.id },
    include: [{ model: Product, as: "product" }],
    order: [["activatedAt", "DESC"]],
    limit: 30,
  });

  if (!codes.length) {
    await ctx.reply(
      t(user.language, "myPromoCodesEmpty"),
      getBackKeyboard(user.language),
    );
    return;
  }

  const lines = codes.map((code, index) => {
    const amount = formatMoney(user.language, code.product.bonusAmount);
    return `${index + 1}. ${code.code} | ${code.product.name} | ${amount} so'm`;
  });

  await ctx.reply(
    `${t(user.language, "myPromoCodesTitle")}\n\n${lines.join("\n")}`,
    getBackKeyboard(user.language),
  );
}

async function showBalance(ctx, user, options = {}) {
  const sessionState = getSessionState(ctx);
  clearFlowState(sessionState);
  setCurrentPage(sessionState, PAGES.BALANCE, options);

  await ctx.reply(
    t(user.language, "balanceText", {
      amount: formatMoney(user.language, user.balance),
    }),
    getBackKeyboard(user.language),
  );
}

async function createWithdrawalRequest(ctx, user, cardNumber, amount) {
  await sequelize.transaction(async (transaction) => {
    const lockedUser = await User.findByPk(user.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const newBalance = Number(lockedUser.balance) - Number(amount);

    if (newBalance < 0) {
      throw new Error("Balans yetarli emas.");
    }

    await lockedUser.update(
      {
        balance: newBalance,
      },
      { transaction },
    );

    await WithdrawalRequest.create(
      {
        userId: user.id,
        amount,
        cardNumber,
      },
      { transaction },
    );

    await BalanceTransaction.create(
      {
        userId: user.id,
        type: "withdrawal_request",
        amount: -Math.abs(Number(amount)),
        metadata: {
          cardNumber,
        },
      },
      { transaction },
    );
  });

  await user.reload();
  await ctx.reply(
    t(user.language, "withdrawalCreated"),
    getMainMenuKeyboard(user.language),
  );
}

async function askPromoCode(ctx, user, options = {}) {
  const sessionState = getSessionState(ctx);
  sessionState.step = "awaiting_promo_code";
  setCurrentPage(sessionState, PAGES.PROMO_INPUT, options);
  await ctx.reply(
    t(user.language, "enterPromoCode"),
    getBackKeyboard(user.language),
  );
}

async function askWithdrawalAmount(ctx, user, options = {}) {
  const sessionState = getSessionState(ctx);
  sessionState.step = "awaiting_withdrawal_amount";
  setCurrentPage(sessionState, PAGES.WITHDRAWAL_AMOUNT, options);
  await ctx.reply(
    t(user.language, "enterWithdrawalAmount"),
    getBackKeyboard(user.language),
  );
}

async function askWithdrawalCard(ctx, user, amount, options = {}) {
  const sessionState = getSessionState(ctx);
  sessionState.step = "awaiting_withdrawal_card";
  sessionState.withdrawalAmount = amount;
  setCurrentPage(sessionState, PAGES.WITHDRAWAL_CARD, options);
  await ctx.reply(
    t(user.language, "enterCardNumber"),
    getBackKeyboard(user.language),
  );
}

async function renderPage(ctx, user, page, options = {}) {
  switch (page) {
    case PAGES.LANGUAGE:
      await askLanguage(ctx, options);
      break;
    case PAGES.CONTACT:
      await askContact(ctx, user, options);
      break;
    case PAGES.PROMO_INPUT:
      await askPromoCode(ctx, user, options);
      break;
    case PAGES.PROMO_LIST:
      await listMyPromoCodes(ctx, user, options);
      break;
    case PAGES.BALANCE:
      await showBalance(ctx, user, options);
      break;
    case PAGES.WITHDRAWAL_AMOUNT:
      await askWithdrawalAmount(ctx, user, options);
      break;
    case PAGES.WITHDRAWAL_CARD:
      await askWithdrawalCard(
        ctx,
        user,
        getSessionState(ctx).withdrawalAmount || 0,
        options,
      );
      break;
    case PAGES.MAIN_MENU:
    default:
      await showMainMenu(ctx, user, "mainMenuHint", options);
      break;
  }
}

bot.start(async (ctx) => {
  const user = await ensureUser(ctx);
  const sessionState = getSessionState(ctx);
  resetNavigation(sessionState);

  if (!user.isRegistered || !isSupportedLocale(user.language)) {
    await askLanguage(ctx, { replace: true });
    return;
  }

  await showMainMenu(ctx, user, "mainMenuHint", { replace: true });
});

bot.on("contact", async (ctx) => {
  const user = await ensureUser(ctx);
  const sessionState = getSessionState(ctx);
  const locale = isSupportedLocale(user.language) ? user.language : "uz";

  if (!user.isRegistered && sessionState.pageKey !== PAGES.CONTACT) {
    await askLanguage(ctx, { replace: true });
    return;
  }

  if (
    ctx.message.contact.user_id &&
    ctx.message.contact.user_id !== ctx.from.id
  ) {
    await ctx.reply(t(locale, "requestOwnContact"), getContactKeyboard(locale));
    return;
  }

  await user.update({
    phoneNumber: ctx.message.contact.phone_number,
    isRegistered: true,
  });

  resetNavigation(sessionState);

  await ctx.reply(
    t(user.language, "registrationDone"),
    getMainMenuKeyboard(user.language),
  );
  setCurrentPage(sessionState, PAGES.MAIN_MENU, { replace: true });
});

bot.on("text", async (ctx) => {
  const user = await ensureUser(ctx);
  const sessionState = getSessionState(ctx);
  const text = String(ctx.message.text || "").trim();
  const selectedLocale = resolveLocaleFromText(text);

  if (selectedLocale) {
    await user.update({ language: selectedLocale });

    if (user.isRegistered) {
      await ctx.reply(
        t(selectedLocale, "languageSaved"),
        getMainMenuKeyboard(selectedLocale),
      );
      resetNavigation(sessionState, PAGES.MAIN_MENU);
      return;
    }

    clearFlowState(sessionState);
    setCurrentPage(sessionState, PAGES.CONTACT, { replace: true });
    await ctx.reply(
      t(selectedLocale, "languageSaved"),
      getContactKeyboard(selectedLocale),
    );
    await ctx.reply(
      t(selectedLocale, "sharePhone"),
      getContactKeyboard(selectedLocale),
    );
    return;
  }

  if (!isSupportedLocale(user.language)) {
    await askLanguage(ctx);
    return;
  }

  if (!user.isRegistered) {
    if (sessionState.pageKey !== PAGES.CONTACT) {
      await askLanguage(ctx, { replace: true });
      return;
    }

    await ctx.reply(
      t(user.language, "contactRequestOnly"),
      getContactKeyboard(user.language),
    );
    return;
  }

  if (text === t(user.language, "back")) {
    clearFlowState(sessionState);
    const previousPage = goBack(sessionState, PAGES.MAIN_MENU);
    await renderPage(ctx, user, previousPage, { replace: true });
    return;
  }

  if (text === t(user.language, "cancel")) {
    resetNavigation(sessionState, PAGES.MAIN_MENU);
    await ctx.reply(
      t(user.language, "actionCanceled"),
      getMainMenuKeyboard(user.language),
    );
    return;
  }

  if (text === t(user.language, "activatePromo")) {
    await askPromoCode(ctx, user);
    return;
  }

  if (text === t(user.language, "myPromocodes")) {
    await listMyPromoCodes(ctx, user);
    return;
  }

  if (text === t(user.language, "myBalance")) {
    await showBalance(ctx, user);
    return;
  }

  if (text === t(user.language, "withdraw")) {
    if (Number(user.balance) <= 0) {
      await ctx.reply(
        t(user.language, "withdrawalNoBalance"),
        getMainMenuKeyboard(user.language),
      );
      return;
    }

    await askWithdrawalAmount(ctx, user);
    return;
  }

  if (sessionState.step === "awaiting_promo_code") {
    clearFlowState(sessionState);
    resetNavigation(sessionState, PAGES.MAIN_MENU);
    await activatePromoCode(ctx, user, text);
    return;
  }

  if (looksLikePromoCode(text)) {
    resetNavigation(sessionState, PAGES.MAIN_MENU);
    await activatePromoCode(ctx, user, text);
    return;
  }

  if (sessionState.step === "awaiting_withdrawal_amount") {
    const amount = Number(String(text).replace(/[^\d]/g, ""));

    if (!amount) {
      await ctx.reply(
        t(user.language, "invalidWithdrawalAmount"),
        getBackKeyboard(user.language),
      );
      return;
    }

    if (amount > Number(user.balance)) {
      await ctx.reply(
        t(user.language, "withdrawalTooMuch", {
          amount: formatMoney(user.language, user.balance),
        }),
        getBackKeyboard(user.language),
      );
      return;
    }

    await askWithdrawalCard(ctx, user, amount);
    return;
  }

  if (sessionState.step === "awaiting_withdrawal_card") {
    const amount = Number(sessionState.withdrawalAmount || 0);
    const cardNumber = text.replace(/\s+/g, " ").trim();

    if (!amount || !cardNumber) {
      await ctx.reply(
        t(user.language, "invalidWithdrawalAmount"),
        getBackKeyboard(user.language),
      );
      return;
    }

    resetNavigation(sessionState, PAGES.MAIN_MENU);
    await createWithdrawalRequest(ctx, user, cardNumber, amount);
    return;
  }

  await ctx.reply(
    t(user.language, "unknownMenuAction"),
    getMainMenuKeyboard(user.language),
  );
});

bot.catch((error) => {
  const traceId = randomBytes(4).toString("hex");
  console.error(`Bot xatoligi [${traceId}]:`, error);
});

async function startBotRuntime() {
  await bot.telegram.setMyCommands([
    { command: "start", description: "Botni ishga tushirish" },
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
  getExpectedWebhookUrl,
  getWebhookPath,
  getWebhookUrl,
  startBotRuntime,
  stopBotRuntime,
  t,
  formatMoney,
};
