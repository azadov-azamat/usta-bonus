const { t } = require("../i18n");

function formatMoney(locale, amount) {
  const language = locale === "ru" ? "ru-RU" : "uz-UZ";
  return new Intl.NumberFormat(language).format(Number(amount || 0));
}

function formatMoneyWithUnit(locale, amount) {
  return `${formatMoney(locale, amount)} ${t(locale, "moneyUnit")}`;
}

module.exports = {
  formatMoney,
  formatMoneyWithUnit,
};
