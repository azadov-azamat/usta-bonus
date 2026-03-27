const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Product",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      bonusAmount: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      importedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: "products",
      underscored: true
    }
  );
