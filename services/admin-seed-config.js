const DEFAULT_ADMIN_LOGIN = "admin";
const DEFAULT_ADMIN_PASSWORD = "changeme123";
const DEFAULT_ADMIN_NAME = "System Admin";

function getAdminSeedConfig() {
  return {
    login: String(process.env.ADMIN_LOGIN || DEFAULT_ADMIN_LOGIN)
      .trim()
      .toLowerCase(),
    password: String(process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD).trim(),
    name: String(process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME).trim() || DEFAULT_ADMIN_NAME
  };
}

module.exports = {
  DEFAULT_ADMIN_LOGIN,
  DEFAULT_ADMIN_NAME,
  DEFAULT_ADMIN_PASSWORD,
  getAdminSeedConfig
};
