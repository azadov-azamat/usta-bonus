const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "BalanceTransaction",
    {
      type: {
        type: DataTypes.ENUM(
          "promo_activation",
          "withdrawal_request",
          "withdrawal_refund"
        ),
        allowNull: false
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true
      }
    },
    {
      tableName: "balance_transactions",
      underscored: true
    }
  );
