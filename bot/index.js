require("dotenv").config();

const { randomBytes } = require("node:crypto");
const { Telegraf, Markup, session } = require("telegraf");
const {
  sequelize,
  User,
  Product,
  PromoCode,
  WithdrawalRequest,
  BalanceTransaction
} = require("../models");
const { getLanguageButtons, supportedLocales, t } = require("./i18n");

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN topilmadi. .env faylga token yozing.");
}

const bot = new Telegraf(token);
const webhookPath = process.env.BOT_WEBHOOK_PATH || "/telegram/webhook";
const runtimeState = {
  started: false,
  mode: "stopped"
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
    [t(locale, "myBalance"), t(locale, "withdraw")]
  ];
}

function getCancelMenu(locale) {
  return [[t(locale, "cancel")]];
}

function getLanguageKeyboard() {
  return Markup.keyboard(
    getLanguageButtons().map((item) => [item.label])
  ).resize();
}

function getContactKeyboard(locale) {
  return Markup.keyboard([
    [Markup.button.contactRequest(t(locale, "contactButton"))]
  ]).resize();
}

function getMainMenuKeyboard(locale) {
  return Markup.keyboard(getMainMenu(locale)).resize();
}

function getCancelKeyboard(locale) {
  return Markup.keyboard(getCancelMenu(locale)).resize();
}

function resolveLocaleFromText(text) {
  const normalizedText = String(text || "").trim();
  const match = getLanguageButtons().find((item) => item.label === normalizedText);
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
      lastName: ctx.from.last_name || null
    }
  });

  user.chatId = chatId;
  user.username = ctx.from.username || user.username;
  user.firstName = ctx.from.first_name || user.firstName;
  user.lastName = ctx.from.last_name || user.lastName;
  await user.save();

  return user;
}

async function askLanguage(ctx) {
  await ctx.reply(t("uz", "chooseLanguage"), getLanguageKeyboard());
}

async function askContact(ctx, user) {
  await ctx.reply(t(user.language, "sharePhone"), getContactKeyboard(user.language));
}

async function showMainMenu(ctx, user, messageKey = "mainMenuHint") {
  await ctx.reply(t(user.language, messageKey), getMainMenuKeyboard(user.language));
}

function getSession(ctx) {
  if (!ctx.session) {
    ctx.session = {};
  }

  return ctx.session;
}

function normalizeCode(code) {
  return String(code || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

async function activatePromoCode(ctx, user, rawCode) {
  const code = normalizeCode(rawCode);

  if (!code) {
    await ctx.reply(t(user.language, "promoNotFound"), getMainMenuKeyboard(user.language));
    return;
  }

  let activationResult = null;
  await sequelize.transaction(async (transaction) => {
    const promoCode = await PromoCode.findOne({
      where: { code },
      include: [{ model: Product, as: "product" }],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!promoCode) {
      activationResult = {
        status: "not_found"
      };
      return;
    }

    if (promoCode.status === "activated") {
      activationResult = {
        status: "already_used"
      };
      return;
    }

    const lockedUser = await User.findByPk(user.id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    const bonusAmount = Number(promoCode.product.bonusAmount);
    const newBalance = Number(lockedUser.balance) + bonusAmount;

    await promoCode.update(
      {
        status: "activated",
        activatedAt: new Date(),
        activatedByUserId: user.id
      },
      { transaction }
    );

    await lockedUser.update(
      {
        balance: newBalance
      },
      { transaction }
    );

    await BalanceTransaction.create(
      {
        userId: user.id,
        type: "promo_activation",
        amount: promoCode.product.bonusAmount,
        metadata: {
          promoCode: promoCode.code,
          productId: promoCode.productId,
          productName: promoCode.product.name
        }
      },
      { transaction }
    );

    activationResult = {
      status: "activated",
      bonusAmount
    };
  });

  await user.reload();

  if (!activationResult || activationResult.status === "not_found") {
    await ctx.reply(t(user.language, "promoNotFound"), getMainMenuKeyboard(user.language));
    return;
  }

  if (activationResult.status === "already_used") {
    await ctx.reply(
      t(user.language, "promoAlreadyUsed"),
      getMainMenuKeyboard(user.language)
    );
    return;
  }

  await ctx.reply(
    t(user.language, "promoActivated", {
      amount: formatMoney(user.language, activationResult.bonusAmount)
    }),
    getMainMenuKeyboard(user.language)
  );
}

async function listMyPromoCodes(ctx, user) {
  const codes = await PromoCode.findAll({
    where: { activatedByUserId: user.id },
    include: [{ model: Product, as: "product" }],
    order: [["activatedAt", "DESC"]],
    limit: 30
  });

  if (!codes.length) {
    await ctx.reply(
      t(user.language, "myPromoCodesEmpty"),
      getMainMenuKeyboard(user.language)
    );
    return;
  }

  const lines = codes.map((code, index) => {
    const amount = formatMoney(user.language, code.product.bonusAmount);
    return `${index + 1}. ${code.code} | ${code.product.name} | ${amount} so'm`;
  });

  await ctx.reply(
    `${t(user.language, "myPromoCodesTitle")}\n\n${lines.join("\n")}`,
    getMainMenuKeyboard(user.language)
  );
}

async function showBalance(ctx, user) {
  await ctx.reply(
    t(user.language, "balanceText", {
      amount: formatMoney(user.language, user.balance)
    }),
    getMainMenuKeyboard(user.language)
  );
}

async function createWithdrawalRequest(ctx, user, cardNumber, amount) {
  await sequelize.transaction(async (transaction) => {
    const lockedUser = await User.findByPk(user.id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    const newBalance = Number(lockedUser.balance) - Number(amount);

    if (newBalance < 0) {
      throw new Error("Balans yetarli emas.");
    }

    await lockedUser.update(
      {
        balance: newBalance
      },
      { transaction }
    );

    await WithdrawalRequest.create(
      {
        userId: user.id,
        amount,
        cardNumber
      },
      { transaction }
    );

    await BalanceTransaction.create(
      {
        userId: user.id,
        type: "withdrawal_request",
        amount: -Math.abs(Number(amount)),
        metadata: {
          cardNumber
        }
      },
      { transaction }
    );
  });

  await user.reload();
  await ctx.reply(
    t(user.language, "withdrawalCreated"),
    getMainMenuKeyboard(user.language)
  );
}

bot.start(async (ctx) => {
  const user = await ensureUser(ctx);
  const sessionState = getSession(ctx);
  sessionState.step = null;

  if (!isSupportedLocale(user.language)) {
    await askLanguage(ctx);
    return;
  }

  if (!user.isRegistered) {
    await askContact(ctx, user);
    return;
  }

  await showMainMenu(ctx, user);
});

bot.on("contact", async (ctx) => {
  const user = await ensureUser(ctx);
  const locale = isSupportedLocale(user.language) ? user.language : "uz";

  if (ctx.message.contact.user_id && ctx.message.contact.user_id !== ctx.from.id) {
    await ctx.reply(t(locale, "requestOwnContact"), getContactKeyboard(locale));
    return;
  }

  await user.update({
    phoneNumber: ctx.message.contact.phone_number,
    isRegistered: true
  });

  const sessionState = getSession(ctx);
  sessionState.step = null;

  await ctx.reply(
    t(user.language, "registrationDone"),
    getMainMenuKeyboard(user.language)
  );
});

bot.on("text", async (ctx) => {
  const user = await ensureUser(ctx);
  const sessionState = getSession(ctx);
  const text = String(ctx.message.text || "").trim();
  const selectedLocale = resolveLocaleFromText(text);

  if (selectedLocale) {
    await user.update({ language: selectedLocale });

    if (user.isRegistered) {
      sessionState.step = null;
      await ctx.reply(
        t(selectedLocale, "languageSaved"),
        getMainMenuKeyboard(selectedLocale)
      );
      return;
    }

    await ctx.reply(t(selectedLocale, "languageSaved"), getContactKeyboard(selectedLocale));
    await ctx.reply(t(selectedLocale, "sharePhone"), getContactKeyboard(selectedLocale));
    return;
  }

  if (!isSupportedLocale(user.language)) {
    await askLanguage(ctx);
    return;
  }

  if (!user.isRegistered) {
    await ctx.reply(t(user.language, "contactRequestOnly"), getContactKeyboard(user.language));
    return;
  }

  if (text === t(user.language, "cancel")) {
    sessionState.step = null;
    sessionState.withdrawalAmount = null;
    await ctx.reply(t(user.language, "actionCanceled"), getMainMenuKeyboard(user.language));
    return;
  }

  if (text === t(user.language, "activatePromo")) {
    sessionState.step = "awaiting_promo_code";
    await ctx.reply(t(user.language, "enterPromoCode"), getCancelKeyboard(user.language));
    return;
  }

  if (text === t(user.language, "myPromocodes")) {
    sessionState.step = null;
    await listMyPromoCodes(ctx, user);
    return;
  }

  if (text === t(user.language, "myBalance")) {
    sessionState.step = null;
    await showBalance(ctx, user);
    return;
  }

  if (text === t(user.language, "withdraw")) {
    if (Number(user.balance) <= 0) {
      await ctx.reply(
        t(user.language, "withdrawalNoBalance"),
        getMainMenuKeyboard(user.language)
      );
      return;
    }

    sessionState.step = "awaiting_withdrawal_amount";
    await ctx.reply(
      t(user.language, "enterWithdrawalAmount"),
      getCancelKeyboard(user.language)
    );
    return;
  }

  if (sessionState.step === "awaiting_promo_code") {
    sessionState.step = null;
    await activatePromoCode(ctx, user, text);
    return;
  }

  if (sessionState.step === "awaiting_withdrawal_amount") {
    const amount = Number(String(text).replace(/[^\d]/g, ""));

    if (!amount) {
      await ctx.reply(
        t(user.language, "invalidWithdrawalAmount"),
        getCancelKeyboard(user.language)
      );
      return;
    }

    if (amount > Number(user.balance)) {
      await ctx.reply(
        t(user.language, "withdrawalTooMuch", {
          amount: formatMoney(user.language, user.balance)
        }),
        getCancelKeyboard(user.language)
      );
      return;
    }

    sessionState.step = "awaiting_withdrawal_card";
    sessionState.withdrawalAmount = amount;
    await ctx.reply(t(user.language, "enterCardNumber"), getCancelKeyboard(user.language));
    return;
  }

  if (sessionState.step === "awaiting_withdrawal_card") {
    const amount = Number(sessionState.withdrawalAmount || 0);
    const cardNumber = text.replace(/\s+/g, " ").trim();

    if (!amount || !cardNumber) {
      sessionState.step = null;
      sessionState.withdrawalAmount = null;
      await ctx.reply(t(user.language, "invalidWithdrawalAmount"), getMainMenuKeyboard(user.language));
      return;
    }

    sessionState.step = null;
    sessionState.withdrawalAmount = null;
    await createWithdrawalRequest(ctx, user, cardNumber, amount);
    return;
  }

  await ctx.reply(t(user.language, "unknownMenuAction"), getMainMenuKeyboard(user.language));
});

bot.catch((error) => {
  const traceId = randomBytes(4).toString("hex");
  console.error(`Bot xatoligi [${traceId}]:`, error);
});

async function startBotRuntime() {
  await bot.telegram.setMyCommands([
    { command: "start", description: "Botni ishga tushirish" }
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
    drop_pending_updates: true
  });
  await bot.launch({
    dropPendingUpdates: true
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
        drop_pending_updates: false
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
  formatMoney
};
