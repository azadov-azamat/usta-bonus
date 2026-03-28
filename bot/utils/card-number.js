function normalizeCardNumber(cardNumber) {
  return String(cardNumber || "").replace(/\D/g, "");
}

function isValidCardNumber(cardNumber) {
  return normalizeCardNumber(cardNumber).length === 16;
}

function formatCardNumber(cardNumber) {
  const normalizedCardNumber = normalizeCardNumber(cardNumber);

  if (!normalizedCardNumber) {
    return null;
  }

  return normalizedCardNumber.match(/.{1,4}/g).join(" ");
}

module.exports = {
  formatCardNumber,
  isValidCardNumber,
  normalizeCardNumber,
};
