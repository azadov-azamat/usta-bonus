const SETTINGS_LANGUAGE_ACTION = "menu:settings_language";
const BACK_ACTION = "menu:back";
const LANGUAGE_ACTION_PREFIX = "menu:language:";
const LANGUAGE_ACTION_REGEX = /^menu:language:(uz|ru|uz-cyrl)$/;
const CONFIRM_CARD_ACTION_PREFIX = "menu:confirm_card:";
const CONFIRM_CARD_ACTION_REGEX =
  /^menu:confirm_card:(withdrawal|settings):(\d{16})$/;

function getLanguageAction(locale) {
  return `${LANGUAGE_ACTION_PREFIX}${locale}`;
}

function getConfirmCardAction(flowType, cardNumber) {
  return `${CONFIRM_CARD_ACTION_PREFIX}${flowType}:${cardNumber}`;
}

function resolveLocaleFromAction(action) {
  const match = LANGUAGE_ACTION_REGEX.exec(String(action || "").trim());

  if (!match) {
    return null;
  }

  return match[1] === "uz-cyrl" ? "uz" : match[1];
}

function resolveConfirmCardAction(action) {
  const match = CONFIRM_CARD_ACTION_REGEX.exec(String(action || "").trim());

  if (!match) {
    return null;
  }

  return {
    flowType: match[1],
    cardNumber: match[2],
  };
}

module.exports = {
  BACK_ACTION,
  CONFIRM_CARD_ACTION_REGEX,
  getConfirmCardAction,
  getLanguageAction,
  LANGUAGE_ACTION_REGEX,
  resolveConfirmCardAction,
  resolveLocaleFromAction,
  SETTINGS_LANGUAGE_ACTION,
};
