const { Markup } = require("telegraf");
const { getLanguageButtons, t } = require("../i18n");

function getMainMenu(locale) {
  return [
    [t(locale, "activatePromo")],
    [t(locale, "myPromocodes")],
    [t(locale, "myBalance")],
    [t(locale, "withdraw")],
    [t(locale, "settings")],
  ];
}

function getBackMenu(locale) {
  return [[t(locale, "back")]];
}

function getSettingsMenu(locale) {
  return [
    [t(locale, "changeLanguage")],
    [t(locale, "back")],
  ];
}

function getLanguageKeyboard(locale, options = {}) {
  const rows = getLanguageButtons().map((item) => [item.label]);

  if (options.showBack && locale) {
    rows.push([t(locale, "back")]);
  }

  return Markup.keyboard(rows).resize();
}

function getContactKeyboard(locale) {
  return Markup.keyboard([
    [Markup.button.contactRequest(t(locale, "contactButton"))],
  ]).resize();
}

function getMainMenuKeyboard(locale) {
  return Markup.keyboard(getMainMenu(locale)).resize();
}

function getSettingsKeyboard(locale) {
  return Markup.keyboard(getSettingsMenu(locale)).resize();
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

function getPromoCodeKeyboard(locale, code, index, options = {}) {
  const rows = [[getPromoCodeCopyButton(code, index)]];

  if (options.showMoreCallbackData) {
    rows.push([
      Markup.button.callback(
        t(locale, "showMorePromoCodes"),
        options.showMoreCallbackData,
      ),
    ]);
  }

  return Markup.inlineKeyboard(rows);
}

module.exports = {
  getBackKeyboard,
  getContactKeyboard,
  getLanguageKeyboard,
  getMainMenuKeyboard,
  getPromoCodeKeyboard,
  getSettingsKeyboard,
};
