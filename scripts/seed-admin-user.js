require("dotenv").config();

const { initDatabase, sequelize, User } = require("../models");
const { seedDefaultAdminUser } = require("../seeders/default-admin-user");

async function main() {
  try {
    await initDatabase();

    const result = await sequelize.transaction(async (transaction) =>
      seedDefaultAdminUser(User, transaction)
    );

    console.log(
      JSON.stringify({
        ok: true,
        ...result
      })
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    try {
      await sequelize.close();
    } catch {}
  }
}

void main();
