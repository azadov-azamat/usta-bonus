require("dotenv").config();

const { initDatabase, sequelize, Product, PromoCode } = require("../models");
const { generatePromoCode } = require("../services/product-import");
const defaultProducts = require("../seeders/default-products");

async function seedDefaultProducts() {
  const summary = {
    createdProducts: 0,
    updatedProducts: 0,
    generatedPromoCodes: 0
  };

  await sequelize.transaction(async (transaction) => {
    for (const item of defaultProducts) {
      const [product, created] = await Product.findOrCreate({
        where: {
          name: item.name
        },
        defaults: item,
        transaction
      });

      if (created) {
        summary.createdProducts += 1;
      } else {
        const shouldUpdate =
          Number(product.quantity) !== Number(item.quantity) ||
          Number(product.bonusAmount) !== Number(item.bonusAmount);

        if (shouldUpdate) {
          await product.update(
            {
              quantity: item.quantity,
              bonusAmount: item.bonusAmount,
              importedAt: new Date()
            },
            { transaction }
          );
          summary.updatedProducts += 1;
        }
      }

      const existingCodesCount = await PromoCode.count({
        where: {
          productId: product.id
        },
        transaction
      });

      const missingCodesCount = Math.max(0, Number(item.quantity) - existingCodesCount);

      if (missingCodesCount > 0) {
        const promoCodes = Array.from({ length: missingCodesCount }).map((_, index) => ({
          productId: product.id,
          code: generatePromoCode(product.id, existingCodesCount + index)
        }));

        await PromoCode.bulkCreate(promoCodes, { transaction });
        summary.generatedPromoCodes += promoCodes.length;
      }
    }
  });

  return summary;
}

async function main() {
  try {
    await initDatabase();
    const summary = await seedDefaultProducts();

    console.log(
      JSON.stringify({
        ok: true,
        productsInSeed: defaultProducts.length,
        ...summary
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
