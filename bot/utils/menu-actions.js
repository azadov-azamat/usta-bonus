const SETTINGS_LANGUAGE_ACTION = "menu:settings_language";
const BACK_ACTION = "menu:back";
const LANGUAGE_ACTION_PREFIX = "menu:language:";
const LANGUAGE_ACTION_REGEX = /^menu:language:(uz|ru|uz-cyrl)$/;

function getLanguageAction(locale) {
  return `${LANGUAGE_ACTION_PREFIX}${locale}`;
}

function resolveLocaleFromAction(action) {
  const match = LANGUAGE_ACTION_REGEX.exec(String(action || "").trim());

  if (!match) {
    return null;
  }

  return match[1] === "uz-cyrl" ? "uz" : match[1];
}

module.exports = {
  BACK_ACTION,
  getLanguageAction,
  LANGUAGE_ACTION_REGEX,
  resolveLocaleFromAction,
  SETTINGS_LANGUAGE_ACTION,
};
