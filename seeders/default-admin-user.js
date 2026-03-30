const { createPasswordDigest } = require("../services/password");
const { getAdminSeedConfig } = require("../services/admin-seed-config");

async function seedDefaultAdminUser(User, transaction) {
  const config = getAdminSeedConfig();
  const digest = createPasswordDigest(config.password);

  const [adminUser, created] = await User.findOrCreate({
    where: {
      login: config.login
    },
    defaults: {
      role: "admin",
      login: config.login,
      firstName: config.name,
      isRegistered: true,
      registrationStatus: "approved",
      registrationReviewedByAdmin: true,
      approvedAt: new Date(),
      passwordHash: digest.hash,
      passwordSalt: digest.salt
    },
    transaction
  });

  if (!created) {
    adminUser.role = "admin";
    adminUser.isRegistered = true;
    adminUser.registrationStatus = "approved";
    adminUser.registrationReviewedByAdmin = true;
    adminUser.approvedAt = adminUser.approvedAt || new Date();
    adminUser.firstName = config.name;
    adminUser.passwordHash = digest.hash;
    adminUser.passwordSalt = digest.salt;
    await adminUser.save({ transaction });
  }

  return {
    created,
    login: config.login,
    fullName: config.name
  };
}

module.exports = {
  seedDefaultAdminUser
};
