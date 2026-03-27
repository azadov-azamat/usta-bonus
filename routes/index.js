const express = require("express");

const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/products", require("./products"));
router.use("/withdrawals", require("./withdrawals"));

router.use((error, req, res, next) => {
  console.error("Admin route xatoligi:", error);
  res.status(500).json({
    ok: false,
    message: error.message || "Server xatoligi yuz berdi.",
  });
});

module.exports = router;
