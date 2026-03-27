function normalizeCode(code) {
  return String(code || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function looksLikePromoCode(rawCode) {
  const code = normalizeCode(rawCode);

  if (code.length < 6) {
    return false;
  }

  if (code.startsWith("TRN-")) {
    return true;
  }

  return /^[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(code) && /[A-Z]/.test(code);
}

module.exports = {
  normalizeCode,
  looksLikePromoCode,
};
