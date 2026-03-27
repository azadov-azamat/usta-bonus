const {
  sequelize,
  User,
  Product,
  PromoCode,
  BalanceTransaction,
} = require("../../models");
const { normalizeCode } = require("../utils/promo-code");

async function activatePromoCode(user, rawCode) {
  const code = normalizeCode(rawCode);

  if (!code) {
    return {
      status: "not_found",
    };
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

  return activationResult || {
    status: "not_found",
  };
}

function listUserPromoCodes(userId) {
  return PromoCode.findAll({
    where: { activatedByUserId: userId },
    include: [{ model: Product, as: "product" }],
    order: [["activatedAt", "DESC"]],
    limit: 30,
  });
}

module.exports = {
  activatePromoCode,
  listUserPromoCodes,
};
