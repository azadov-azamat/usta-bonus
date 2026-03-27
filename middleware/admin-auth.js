const { User } = require("../models");
const {
  ADMIN_AUTH_COOKIE_NAME,
  parseCookies,
  verifySessionToken
} = require("../services/admin-auth");

async function requireAdminAuth(req, res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_AUTH_COOKIE_NAME];
    const session = verifySessionToken(token);

    if (!session || session.role !== "admin") {
      res.status(401).json({
        ok: false,
        message: "Admin avtorizatsiyasi talab qilinadi."
      });
      return;
    }

    const adminUser = await User.findOne({
      where: {
        id: session.userId,
        role: "admin"
      }
    });

    if (!adminUser) {
      res.status(401).json({
        ok: false,
        message: "Admin sessiyasi yaroqsiz."
      });
      return;
    }

    req.adminUser = adminUser;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireAdminAuth
};
