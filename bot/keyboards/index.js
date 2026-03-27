const { Markup } = require("telegraf");
const { getLanguageButtons, t } = require("../i18n");

function getMainMenu(locale) {
  return [
    [t(locale, "activatePromo"), t(locale, "myPromocodes")],
    [t(locale, "myBalance"), t(locale, "withdraw")],
  ];
}

function getBackMenu(locale) {
  return [[t(locale, "back")]];
}

function getLanguageKeyboard() {
  return Markup.keyboard(
    getLanguageButtons().map((item) => [item.label]),
  ).resize();
}

function getContactKeyboard(locale) {
  return Markup.keyboard([
    [Markup.button.contactRequest(t(locale, "contactButton"))],
  ]).resize();
}

function getMainMenuKeyboard(locale) {
  return Markup.keyboard(getMainMenu(locale)).resize();
}

function getBackKeyboard(locale) {
  return Markup.keyboard(getBackMenu(locale)).resize();
}

function getPromoCodeCopyButton(code, index) {
  return {
    text: `${index + 1}. ${code}`,
    copy_text: {
      text: code,
    },
  };
}

function getPromoCodeCopyKeyboard(codes) {
  return Markup.inlineKeyboard(
    codes.map((code, index) => [getPromoCodeCopyButton(code.code, index)]),
  );
}

module.exports = {
  getBackKeyboard,
  getContactKeyboard,
  getLanguageKeyboard,
  getMainMenuKeyboard,
  getPromoCodeCopyKeyboard,
};
