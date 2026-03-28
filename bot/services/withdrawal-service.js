const {
  sequelize,
  User,
  WithdrawalRequest,
  BalanceTransaction,
} = require("../../models");

async function createWithdrawalRequest(user, cardNumber, amount) {
  let createdRequest = null;

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
  return createdRequest;
}

module.exports = {
  createWithdrawalRequest,
};
