const express = require("express");
const { requireAdminAuth } = require("../middleware/admin-auth");
const { User } = require("../models");
const {
  clearAdminSessionCookie,
  createSessionToken,
  setAdminSessionCookie,
} = require("../services/admin-auth");
const { mapAdminSession } = require("./admin-shared");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const login = String(req.body.login || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!login || !password) {
      res.status(400).json({
        ok: false,
        message: "Login va parol kiritilishi kerak.",
      });
      return;
    }

    const adminUser = await User.findOne({
      where: {
        login,
        role: "admin",
      },
    });

    if (!adminUser || !adminUser.verifyPassword(password)) {
      res.status(401).json({
        ok: false,
        message: "Login yoki parol noto'g'ri.",
      });
      return;
    }

    adminUser.lastLoginAt = new Date();
    await adminUser.save();

    const token = createSessionToken(adminUser);
    setAdminSessionCookie(res, token);

    res.json({
      ok: true,
      item: mapAdminSession(adminUser),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  clearAdminSessionCookie(res);
  res.json({
    ok: true,
  });
});

router.get("/session", requireAdminAuth, (req, res) => {
  res.json({
    ok: true,
    item: mapAdminSession(req.adminUser),
  });
});

module.exports = router;
