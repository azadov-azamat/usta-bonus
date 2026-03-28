const { getLanguageButtons, getLanguageLabel, supportedLocales } = require("../i18n");

const legacyLocaleMap = {
  "uz-cyrl": "uz",
};

const languageAliases = {
  uz: ["O'zbekcha", "O‘zbekcha", "Ozbekcha", "Ўзбекча"],
  ru: ["Русский"],
};

function normalizeLanguageText(text) {
  return String(text || "")
    .normalize("NFKC")
    .trim()
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/\s+/g, " ");
}

function isSupportedLocale(locale) {
  return supportedLocales.includes(locale);
}

function isKnownLocale(locale) {
  return isSupportedLocale(locale) || Boolean(legacyLocaleMap[locale]);
}

function normalizeLocale(locale) {
  const resolvedLocale = legacyLocaleMap[locale] || locale;
  return isSupportedLocale(resolvedLocale) ? resolvedLocale : "uz";
}

function resolveLocaleFromText(text) {
  const normalizedText = normalizeLanguageText(text);

  if (!normalizedText) {
    return null;
  }

  const buttonMatch = getLanguageButtons().find(
    (item) => normalizeLanguageText(item.label) === normalizedText,
  );

  if (buttonMatch) {
    return buttonMatch.locale;
  }

  return (
    supportedLocales.find((locale) => {
      const candidates = [
        getLanguageLabel(locale),
        locale,
        ...(languageAliases[locale] || []),
      ];

      return candidates.some(
        (candidate) => normalizeLanguageText(candidate) === normalizedText,
      );
    }) || null
  );
}

function getUserLocale(user) {
  return normalizeLocale(user?.language);
}

module.exports = {
  getUserLocale,
  isKnownLocale,
  normalizeLocale,
  isSupportedLocale,
  resolveLocaleFromText,
};
