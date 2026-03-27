require("dotenv").config();

const { Sequelize } = require("sequelize");
const { seedDefaultAdminUser } = require("../seeders/default-admin-user");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL topilmadi. .env faylda yozilishi kerak.");
}

const useSsl = process.env.DATABASE_SSL !== "false";

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: false,
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : undefined
});

const User = require("./user")(sequelize);
const Product = require("./product")(sequelize);
const PromoCode = require("./promo-code")(sequelize);
const WithdrawalRequest = require("./withdrawal-request")(sequelize);
const BalanceTransaction = require("./balance-transaction")(sequelize);

Product.hasMany(PromoCode, {
  foreignKey: "productId",
  as: "promoCodes"
});
PromoCode.belongsTo(Product, {
  foreignKey: "productId",
  as: "product"
});

User.hasMany(PromoCode, {
  foreignKey: "activatedByUserId",
  as: "activatedPromoCodes"
});
PromoCode.belongsTo(User, {
  foreignKey: "activatedByUserId",
  as: "activatedBy"
});

User.hasMany(WithdrawalRequest, {
  foreignKey: "userId",
  as: "withdrawalRequests"
});
WithdrawalRequest.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

User.hasMany(BalanceTransaction, {
  foreignKey: "userId",
  as: "transactions"
});
BalanceTransaction.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

async function initDatabase() {
  await sequelize.authenticate();
  await sequelize.sync(
    process.env.DB_SYNC_ALTER === "true"
      ? {
          alter: true
        }
      : undefined
  );
  await ensureWithdrawalReceiptColumns();
  await ensureAdminUser();
}

async function ensureAdminUser() {
  await seedDefaultAdminUser(User);
}

async function ensureWithdrawalReceiptColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("withdrawal_requests");

  if (!table.receipt_image_data) {
    await queryInterface.addColumn("withdrawal_requests", "receipt_image_data", {
      type: Sequelize.BLOB("long"),
      allowNull: true
    });
  }

  if (!table.receipt_image_mime_type) {
    await queryInterface.addColumn("withdrawal_requests", "receipt_image_mime_type", {
      type: Sequelize.STRING,
      allowNull: true
    });
  }

  if (!table.receipt_image_name) {
    await queryInterface.addColumn("withdrawal_requests", "receipt_image_name", {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}

module.exports = {
  sequelize,
  initDatabase,
  User,
  Product,
  PromoCode,
  WithdrawalRequest,
  BalanceTransaction
};
