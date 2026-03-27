const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const { Op } = require("sequelize");
const { requireAdminAuth } = require("../middleware/admin-auth");
const { User, WithdrawalRequest } = require("../models");
const { formatMoney, t } = require("../bot");
const {
  mapWithdrawal,
  receiptUpload,
  sendReceiptToTelegram,
} = require("./admin-shared");

const router = express.Router();

router.use(requireAdminAuth);

router.get("/", async (req, res, next) => {
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

router.get("/:id(\\d+)", async (req, res, next) => {
  try {
    const request = await WithdrawalRequest.findByPk(req.params.id, {
      include: [{ model: User, as: "user" }],
    });

    if (!request) {
      res.status(404).json({
        ok: false,
        message: "Ariza topilmadi.",
      });
      return;
    }

    res.json({
      ok: true,
      item: mapWithdrawal(req, request),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/receipt", async (req, res, next) => {
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

router.post("/:id/complete", receiptUpload.single("receipt"), async (req, res, next) => {
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
});

module.exports = router;
