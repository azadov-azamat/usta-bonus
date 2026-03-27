const express = require("express");
const { requireAdminAuth } = require("../middleware/admin-auth");
const { Product, PromoCode, User, WithdrawalRequest } = require("../models");
const { mapUser } = require("./admin-shared");

const router = express.Router();

router.use(requireAdminAuth);

const userInclude = [
  {
    model: PromoCode,
    as: "activatedPromoCodes",
    required: false,
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "bonusAmount"],
      },
    ],
  },
  {
    model: WithdrawalRequest,
    as: "withdrawalRequests",
    required: false,
  },
];

router.get("/", async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: {
        role: "worker",
      },
      include: userInclude,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      ok: true,
      items: users.map(mapUser),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id(\\d+)", async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id,
        role: "worker",
      },
      include: userInclude,
    });

    if (!user) {
      res.status(404).json({
        ok: false,
        message: "Foydalanuvchi topilmadi.",
      });
      return;
    }

    res.json({
      ok: true,
      item: mapUser(user),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
