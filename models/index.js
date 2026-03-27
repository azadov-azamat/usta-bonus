require("dotenv").config();

const { Sequelize } = require("sequelize");
const { createPasswordDigest } = require("../services/password");

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
  await ensureAdminUser();
}

async function ensureAdminUser() {
  const login = String(process.env.ADMIN_LOGIN || "")
    .trim()
    .toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "").trim();

  if (!login || !password) {
    console.warn(
      "ADMIN_LOGIN yoki ADMIN_PASSWORD topilmadi. Admin panel uchun admin user yaratilmaydi."
    );
    return;
  }

  const digest = createPasswordDigest(password);
  const [adminUser, created] = await User.findOrCreate({
    where: { login },
    defaults: {
      role: "admin",
      login,
      firstName: process.env.ADMIN_NAME || "Admin",
      isRegistered: true,
      passwordHash: digest.hash,
      passwordSalt: digest.salt
    }
  });

  if (created) {
    return;
  }

  adminUser.role = "admin";
  adminUser.isRegistered = true;
  adminUser.firstName = adminUser.firstName || process.env.ADMIN_NAME || "Admin";
  adminUser.passwordHash = digest.hash;
  adminUser.passwordSalt = digest.salt;
  await adminUser.save();
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
