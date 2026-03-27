const { getLanguageButtons, supportedLocales } = require("../i18n");

function isSupportedLocale(locale) {
  return supportedLocales.includes(locale);
}

function resolveLocaleFromText(text) {
  const normalizedText = String(text || "").trim();
  const match = getLanguageButtons().find(
    (item) => item.label === normalizedText,
  );
  return match ? match.locale : null;
}

function getUserLocale(user) {
  return isSupportedLocale(user?.language) ? user.language : "uz";
}

module.exports = {
  getUserLocale,
  isSupportedLocale,
  resolveLocaleFromText,
};
