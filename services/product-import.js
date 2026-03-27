const { randomBytes } = require("node:crypto");
const xlsx = require("xlsx");

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function resolveColumnIndexes(headerRow) {
  const headers = headerRow.map(normalizeHeader);

  const nameIndex = headers.findIndex(
    (header) =>
      header.includes("наименование") ||
      header.includes("nomi") ||
      header.includes("название") ||
      header.includes("name")
  );

  const quantityIndex = headers.findIndex(
    (header) =>
      header.includes("сони") ||
      header.includes("колич") ||
      header.includes("quantity")
  );

  const bonusIndex = headers.findIndex(
    (header) =>
      header.includes("бал") ||
      header.includes("bonus") ||
      header.includes("сум") ||
      header.includes("amount")
  );

  return {
    nameIndex,
    quantityIndex,
    bonusIndex
  };
}

function parseInteger(value) {
  const digits = String(value || "").replace(/[^\d-]/g, "");
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseProductsFromWorkbook(buffer) {
  const workbook = xlsx.read(buffer, {
    type: "buffer"
  });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("Excel faylda sheet topilmadi.");
  }

  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    raw: false
  });

  const headerRowIndex = rows.findIndex((row) => {
    const indexes = resolveColumnIndexes(row);
    return indexes.nameIndex >= 0 && indexes.quantityIndex >= 0 && indexes.bonusIndex >= 0;
  });

  if (headerRowIndex < 0) {
    throw new Error("Excel sarlavhalari topilmadi.");
  }

  const headerIndexes = resolveColumnIndexes(rows[headerRowIndex]);
  const products = [];

  rows.slice(headerRowIndex + 1).forEach((row) => {
    const name = String(row[headerIndexes.nameIndex] || "").trim();
    const quantity = parseInteger(row[headerIndexes.quantityIndex]);
    const bonusAmount = parseInteger(row[headerIndexes.bonusIndex]);

    if (!name || !Number.isFinite(quantity) || !Number.isFinite(bonusAmount)) {
      return;
    }

    if (quantity <= 0 || bonusAmount <= 0) {
      return;
    }

    products.push({
      name,
      quantity,
      bonusAmount
    });
  });

  if (!products.length) {
    throw new Error("Excel ichidan mahsulotlar topilmadi.");
  }

  return products;
}

function generatePromoCode(productId, index) {
  const randomPart = randomBytes(4).toString("hex").toUpperCase();
  return `TRN-${productId}-${index + 1}-${randomPart}`;
}

module.exports = {
  generatePromoCode,
  parseProductsFromWorkbook
};
