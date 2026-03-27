const express = require("express");
const { requireAdminAuth } = require("../middleware/admin-auth");
const { sequelize, Product, PromoCode, User } = require("../models");
const {
  generatePromoCode,
  parseProductsFromWorkbook,
} = require("../services/product-import");
const {
  excelUpload,
  mapProduct,
  mapPromoCode,
} = require("./admin-shared");

const router = express.Router();

router.use(requireAdminAuth);

router.get("/", async (req, res, next) => {
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

router.get("/:id(\\d+)", async (req, res, next) => {
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

router.post("/import", excelUpload.single("file"), async (req, res, next) => {
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
});

module.exports = router;
