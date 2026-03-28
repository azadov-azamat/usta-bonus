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
  await ensureUserProfileColumns();
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

async function ensureUserProfileColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("users");

  if (!table.language_selected) {
    await queryInterface.addColumn("users", "language_selected", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  }

  if (!table.withdrawal_card_number) {
    await queryInterface.addColumn("users", "withdrawal_card_number", {
      type: Sequelize.STRING,
      allowNull: true
    });
  }

  await sequelize.query(`
    UPDATE users
    SET language_selected = TRUE
    WHERE language_selected = FALSE
      AND (
        is_registered = TRUE
        OR phone_number IS NOT NULL
        OR language IN ('ru', 'uz-cyrl')
      )
  `);

  await sequelize.query(`
    UPDATE users
    SET is_registered = TRUE
    WHERE is_registered = FALSE
      AND language_selected = TRUE
      AND phone_number IS NOT NULL
  `);
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
