const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const multer = require("multer");
const { Op } = require("sequelize");
const { requireAdminAuth } = require("../middleware/admin-auth");
const {
  sequelize,
  User,
  Product,
  PromoCode,
  WithdrawalRequest,
} = require("../models");
const { bot, formatMoney, t } = require("../bot");
const {
  generatePromoCode,
  parseProductsFromWorkbook,
} = require("../services/product-import");
const {
  clearAdminSessionCookie,
  createSessionToken,
  setAdminSessionCookie,
} = require("../services/admin-auth");

const router = express.Router();
const TELEGRAM_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
const TELEGRAM_DOCUMENT_MAX_BYTES = 50 * 1024 * 1024;

const excelUpload = multer({
  storage: multer.memoryStorage(),
});

const receiptUpload = multer({
  storage: multer.memoryStorage(),
});

function isTelegramPhotoTooLargeError(error) {
  return (
    error &&
    typeof error.description === "string" &&
    error.description.includes("too big for a photo")
  );
}

async function sendReceiptToTelegram(user, file, caption) {
  if (file.size > TELEGRAM_DOCUMENT_MAX_BYTES) {
    const maxSizeMb = Math.floor(TELEGRAM_DOCUMENT_MAX_BYTES / (1024 * 1024));
    throw new Error(
      `Chek fayli juda katta. ${maxSizeMb} MB dan kichik fayl yuklang.`,
    );
  }

  const payload = {
    source: file.buffer,
    filename: file.originalname || `withdrawal-${Date.now()}`,
  };

  const shouldSendAsDocument =
    !String(file.mimetype || "").startsWith("image/") ||
    file.size > TELEGRAM_PHOTO_MAX_BYTES;

  if (shouldSendAsDocument) {
    return bot.telegram.sendDocument(user.chatId, payload, { caption });
  }

  try {
    return await bot.telegram.sendPhoto(
      user.chatId,
      {
        source: file.buffer,
      },
      {
        caption,
      },
    );
  } catch (error) {
    if (!isTelegramPhotoTooLargeError(error)) {
      throw error;
    }

    return bot.telegram.sendDocument(user.chatId, payload, { caption });
  }
}

function getReceiptImageUrl(req, request) {
  if (!request.receiptImageData && !request.receiptImagePath) {
    return null;
  }

  return `${req.protocol}://${req.get("host")}/api/admin/withdrawals/${request.id}/receipt`;
}

function mapUser(user) {
  const promoCodes = user.activatedPromoCodes || [];
  const withdrawals = user.withdrawalRequests || [];
  const withdrawnAmount = withdrawals
    .filter((request) => request.status !== "rejected")
    .reduce((total, request) => total + Number(request.amount), 0);

  return {
    id: user.id,
    telegramId: user.telegramId,
    fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
    username: user.username,
    phoneNumber: user.phoneNumber,
    language: user.language,
    balance: Number(user.balance),
    isRegistered: user.isRegistered,
    promoCodesCount: promoCodes.length,
    totalEarned: promoCodes.reduce(
      (total, code) =>
        total + Number(code.product ? code.product.bonusAmount : 0),
      0,
    ),
    totalWithdrawn: withdrawnAmount,
    createdAt: user.createdAt,
  };
}

function mapAdminSession(user) {
  return {
    id: user.id,
    login: user.login,
    role: user.role,
    fullName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") || "Admin",
  };
}

function mapProduct(product) {
  const codes = product.promoCodes || [];

  return {
    id: product.id,
    name: product.name,
    quantity: product.quantity,
    bonusAmount: Number(product.bonusAmount),
    generatedCodesCount: codes.length,
    activatedCodesCount: codes.filter((code) => code.status === "activated")
      .length,
    availableCodesCount: codes.filter((code) => code.status === "new").length,
    createdAt: product.createdAt,
  };
}

function mapPromoCode(code) {
  return {
    id: code.id,
    code: code.code,
    status: code.status,
    activatedAt: code.activatedAt,
    activatedBy: code.activatedBy
      ? {
          id: code.activatedBy.id,
          telegramId: code.activatedBy.telegramId,
          fullName: [code.activatedBy.firstName, code.activatedBy.lastName]
            .filter(Boolean)
            .join(" "),
          phoneNumber: code.activatedBy.phoneNumber,
        }
      : null,
  };
}

function mapWithdrawal(req, request) {
  return {
    id: request.id,
    amount: Number(request.amount),
    cardNumber: request.cardNumber,
    status: request.status,
    requestedAt: request.requestedAt,
    completedAt: request.completedAt,
    receiptImagePath: request.receiptImagePath,
    receiptImageUrl: getReceiptImageUrl(req, request),
    user: request.user
      ? {
          id: request.user.id,
          telegramId: request.user.telegramId,
          fullName: [request.user.firstName, request.user.lastName]
            .filter(Boolean)
            .join(" "),
          phoneNumber: request.user.phoneNumber,
          language: request.user.language,
          chatId: request.user.chatId,
        }
      : null,
  };
}

router.post("/auth/login", async (req, res, next) => {
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

router.post("/auth/logout", (req, res) => {
  clearAdminSessionCookie(res);
  res.json({
    ok: true,
  });
});

router.use(requireAdminAuth);

router.get("/auth/session", (req, res) => {
  res.json({
    ok: true,
    item: mapAdminSession(req.adminUser),
  });
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: {
        role: "worker",
      },
      include: [
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
      ],
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

router.get("/products", async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: PromoCode,
          as: "promoCodes",
          required: false,
          attributes: ["id", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      ok: true,
      items: products.map(mapProduct),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/products/:id(\\d+)", async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: PromoCode,
          as: "promoCodes",
          required: false,
          include: [
            {
              model: User,
              as: "activatedBy",
              required: false,
              attributes: [
                "id",
                "telegramId",
                "firstName",
                "lastName",
                "phoneNumber",
              ],
            },
          ],
        },
      ],
      order: [
        [{ model: PromoCode, as: "promoCodes" }, "status", "ASC"],
        [{ model: PromoCode, as: "promoCodes" }, "createdAt", "DESC"],
      ],
    });

    if (!product) {
      res.status(404).json({
        ok: false,
        message: "Mahsulot topilmadi.",
      });
      return;
    }

    res.json({
      ok: true,
      item: {
        ...mapProduct(product),
        promoCodes: (product.promoCodes || []).map(mapPromoCode),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/products/import",
  excelUpload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({
          ok: false,
          message: "Excel fayl yuborilmadi.",
        });
        return;
      }

      const parsedProducts = parseProductsFromWorkbook(req.file.buffer);
      let totalCodes = 0;

      await sequelize.transaction(async (transaction) => {
        for (const parsedProduct of parsedProducts) {
          const product = await Product.create(parsedProduct, { transaction });
          const promoCodes = Array.from({ length: parsedProduct.quantity }).map(
            (_, index) => ({
              productId: product.id,
              code: generatePromoCode(product.id, index),
            }),
          );

          totalCodes += promoCodes.length;
          await PromoCode.bulkCreate(promoCodes, { transaction });
        }
      });

      res.json({
        ok: true,
        importedProducts: parsedProducts.length,
        generatedPromoCodes: totalCodes,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/withdrawals", async (req, res, next) => {
  try {
    const requests = await WithdrawalRequest.findAll({
      include: [
        {
          model: User,
          as: "user",
        },
      ],
      order: [["requestedAt", "DESC"]],
    });

    const statusOrder = {
      pending: 0,
      completed: 1,
      rejected: 2,
    };

    requests.sort((left, right) => {
      const leftOrder = statusOrder[left.status] ?? 99;
      const rightOrder = statusOrder[right.status] ?? 99;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return (
        new Date(right.requestedAt).getTime() -
        new Date(left.requestedAt).getTime()
      );
    });

    res.json({
      ok: true,
      items: requests.map((request) => mapWithdrawal(req, request)),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/withdrawals/:id/receipt", async (req, res, next) => {
  try {
    const request = await WithdrawalRequest.findByPk(req.params.id);

    if (!request) {
      res.status(404).json({
        ok: false,
        message: "Ariza topilmadi.",
      });
      return;
    }

    if (request.receiptImageData) {
      res.setHeader(
        "Content-Type",
        request.receiptImageMimeType || "application/octet-stream",
      );
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${request.receiptImageName || `withdrawal-${request.id}`}"`,
      );
      res.send(request.receiptImageData);
      return;
    }

    if (request.receiptImagePath) {
      const absolutePath = path.join(__dirname, "..", request.receiptImagePath);

      if (fs.existsSync(absolutePath)) {
        res.sendFile(absolutePath);
        return;
      }
    }

    res.status(404).json({
      ok: false,
      message: "Kvitansiya rasmi topilmadi.",
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/withdrawals/:id/complete",
  receiptUpload.single("receipt"),
  async (req, res, next) => {
    try {
      const request = await WithdrawalRequest.findOne({
        where: {
          id: req.params.id,
          status: {
            [Op.in]: ["pending"],
          },
        },
        include: [{ model: User, as: "user" }],
      });

      if (!request) {
        res.status(404).json({
          ok: false,
          message: "Ariza topilmadi yoki allaqachon yopilgan.",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          ok: false,
          message: "Kvitansiya rasmi yuborilmadi.",
        });
        return;
      }

      const caption = t(request.user.language, "paymentReceiptCaption", {
        amount: formatMoney(request.user.language, request.amount),
      });

      const telegramMessage = await sendReceiptToTelegram(
        request.user,
        req.file,
        caption,
      );

      await request.update({
        status: "completed",
        completedAt: new Date(),
        receiptImageData: req.file.buffer,
        receiptImageMimeType: req.file.mimetype || null,
        receiptImageName:
          req.file.originalname || `withdrawal-${request.id}.jpg`,
        receiptImagePath: null,
        receiptTelegramMessageId: String(telegramMessage.message_id),
      });

      res.json({
        ok: true,
        item: mapWithdrawal(req, request),
      });
    } catch (error) {
      next(error);
    }
  },
);

router.use((error, req, res, next) => {
  console.error("Admin route xatoligi:", error);
  res.status(500).json({
    ok: false,
    message: error.message || "Server xatoligi yuz berdi.",
  });
});

module.exports = router;
