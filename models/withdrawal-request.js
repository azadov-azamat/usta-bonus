const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "WithdrawalRequest",
    {
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      cardNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "rejected"),
        allowNull: false,
        defaultValue: "pending"
      },
      requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      receiptImagePath: {
        type: DataTypes.STRING,
        allowNull: true
      },
      receiptTelegramMessageId: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: "withdrawal_requests",
      underscored: true
    }
  );
