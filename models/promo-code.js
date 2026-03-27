const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "PromoCode",
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: DataTypes.ENUM("new", "activated"),
        allowNull: false,
        defaultValue: "new"
      },
      activatedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "promo_codes",
      underscored: true
    }
  );
