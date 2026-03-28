const {
  sequelize,
  User,
  WithdrawalRequest,
  BalanceTransaction,
} = require("../../models");
const { formatCardNumber } = require("../utils/card-number");

async function createWithdrawalRequest(user, cardNumber, amount) {
  let createdRequest = null;
  const formattedCardNumber = formatCardNumber(cardNumber) || String(cardNumber || "").trim();

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

    createdRequest = await WithdrawalRequest.create(
      {
        userId: user.id,
        amount,
        cardNumber: formattedCardNumber,
      },
      { transaction },
    );

    await BalanceTransaction.create(
      {
        userId: user.id,
        type: "withdrawal_request",
        amount: -Math.abs(Number(amount)),
        metadata: {
          cardNumber: formattedCardNumber,
        },
      },
      { transaction },
    );
  });

  await user.reload();
  return createdRequest;
}

module.exports = {
  createWithdrawalRequest,
};
