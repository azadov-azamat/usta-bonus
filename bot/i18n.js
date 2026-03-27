const i18next = require("i18next");

const supportedLocales = ["uz", "ru", "uz-cyrl"];

const resources = {
  uz: {
    translation: {
      chooseLanguage: "Iltimos, kerakli tilni tanlang.",
      languageSaved: "Til saqlandi.",
      sharePhone: "Registratsiyani tugatish uchun telefon raqamingizni yuboring.",
      contactButton: "Telefon raqamni yuborish",
      registrationDone:
        "Registratsiya muvaffaqiyatli tugadi. Endi promokodlaringizni kiritishingiz mumkin.",
      mainMenuHint: "Asosiy menyudan kerakli bo'limni tanlang.",
      activatePromo: "Promokodni aktivlashtirish",
      myPromocodes: "Promokodlarim",
      myBalance: "Balansim",
      withdraw: "Pul yechish",
      back: "Orqaga",
      cancel: "Bekor qilish",
      enterPromoCode: "Promokodni yuboring.",
      promoActivated:
        "Promokod aktivlashtirildi. Balansingizga {{amount}} so'm qo'shildi.",
      promoNotFound: "Bunday promokod topilmadi.",
      promoAlreadyUsed: "Bu promokod allaqachon ishlatilgan.",
      myPromoCodesEmpty: "Sizda hali aktivlashtirilgan promokodlar yo'q.",
      myPromoCodesTitle: "Sizning promokodlaringiz:",
      myPromoCodesCopyHint: "Promokodni nusxalash uchun tugmani bosing.",
      showMorePromoCodes: "Yana ko'rsatish",
      allPromoCodesShown: "Barcha promokodlar ko'rsatildi.",
      productLabel: "Mahsulot",
      priceLabel: "Narxi",
      moneyUnit: "so'm",
      balanceText: "Joriy balans: {{amount}} so'm",
      withdrawalNoBalance: "Balansingizda yechib olish uchun mablag' yo'q.",
      enterWithdrawalAmount:
        "Joriy balans: {{amount}} so'm\n\nKartaga o'tkazish uchun summani yuboring. Masalan: 300000",
      invalidWithdrawalAmount: "Summani to'g'ri formatda kiriting.",
      withdrawalTooMuch:
        "Kiritilgan summa balansingizdan katta. Joriy balans: {{amount}} so'm",
      enterCardNumber:
        "Karta raqamingizni yuboring. Masalan: 8600 1234 5678 9012",
      withdrawalCreated:
        "So'rovingiz qabul qilindi. To'lov 24 soat ichida amalga oshiriladi.",
      actionCanceled: "Amaliyot bekor qilindi.",
      contactRequestOnly: "Telefon raqamni tugma orqali yuboring.",
      unknownMenuAction:
        "Kerakli bo'limni keyboard tugmalari orqali tanlang.",
      paymentReceiptCaption:
        "Assalomu alaykum. {{amount}} so'mlik to'lovingiz amalga oshirildi.",
      requestOwnContact:
        "Iltimos, aynan o'zingizning telefon raqamingizni yuboring.",
      notRegistered: "Avval registratsiyani yakunlang.",
      languageNames: {
        uz: "O'zbekcha",
        ru: "Русский",
        "uz-cyrl": "Ўзбекча"
      }
    }
  },
  ru: {
    translation: {
      chooseLanguage: "Пожалуйста, выберите язык.",
      languageSaved: "Язык сохранен.",
      sharePhone: "Для завершения регистрации отправьте номер телефона.",
      contactButton: "Отправить номер телефона",
      registrationDone:
        "Регистрация успешно завершена. Теперь можете активировать промокоды.",
      mainMenuHint: "Выберите нужный раздел из главного меню.",
      activatePromo: "Активировать промокод",
      myPromocodes: "Мои промокоды",
      myBalance: "Мой баланс",
      withdraw: "Вывод средств",
      back: "Назад",
      cancel: "Отмена",
      enterPromoCode: "Отправьте промокод.",
      promoActivated:
        "Промокод активирован. На баланс начислено {{amount}} сум.",
      promoNotFound: "Такой промокод не найден.",
      promoAlreadyUsed: "Этот промокод уже использован.",
      myPromoCodesEmpty: "У вас пока нет активированных промокодов.",
      myPromoCodesTitle: "Ваши промокоды:",
      myPromoCodesCopyHint: "Нажмите на кнопку, чтобы скопировать промокод.",
      showMorePromoCodes: "Показать еще",
      allPromoCodesShown: "Все промокоды уже показаны.",
      productLabel: "Товар",
      priceLabel: "Цена",
      moneyUnit: "сум",
      balanceText: "Текущий баланс: {{amount}} сум",
      withdrawalNoBalance: "На балансе нет средств для вывода.",
      enterWithdrawalAmount:
        "Текущий баланс: {{amount}} сум\n\nОтправьте сумму для перевода на карту. Например: 300000",
      invalidWithdrawalAmount: "Введите сумму в правильном формате.",
      withdrawalTooMuch:
        "Указанная сумма больше вашего баланса. Текущий баланс: {{amount}} сум",
      enterCardNumber:
        "Отправьте номер карты. Например: 8600 1234 5678 9012",
      withdrawalCreated:
        "Заявка принята. Перевод будет выполнен в течение 24 часов.",
      actionCanceled: "Операция отменена.",
      contactRequestOnly: "Отправьте номер телефона через кнопку.",
      unknownMenuAction: "Выберите нужный раздел кнопками клавиатуры.",
      paymentReceiptCaption:
        "Здравствуйте. Ваш перевод на сумму {{amount}} сум выполнен.",
      requestOwnContact: "Пожалуйста, отправьте именно свой номер телефона.",
      notRegistered: "Сначала завершите регистрацию.",
      languageNames: {
        uz: "O'zbekcha",
        ru: "Русский",
        "uz-cyrl": "Ўзбекча"
      }
    }
  },
  "uz-cyrl": {
    translation: {
      chooseLanguage: "Илтимос, керакли тилни танланг.",
      languageSaved: "Тил сақланди.",
      sharePhone:
        "Рўйхатдан ўтишни тугатиш учун телефон рақамингизни юборинг.",
      contactButton: "Телефон рақамни юбориш",
      registrationDone:
        "Рўйхатдан ўтиш муваффақиятли тугади. Энди промокодларни киритишингиз мумкин.",
      mainMenuHint: "Асосий менюдан керакли бўлимни танланг.",
      activatePromo: "Промокодни активлаштириш",
      myPromocodes: "Промокодларим",
      myBalance: "Балансим",
      withdraw: "Пул ечиш",
      back: "Орқага",
      cancel: "Бекор қилиш",
      enterPromoCode: "Промокодни юборинг.",
      promoActivated:
        "Промокод активлаштирилди. Балансингизга {{amount}} сўм қўшилди.",
      promoNotFound: "Бундай промокод топилмади.",
      promoAlreadyUsed: "Бу промокод аллақачон ишлатилган.",
      myPromoCodesEmpty: "Сизда ҳали активлаштирилган промокодлар йўқ.",
      myPromoCodesTitle: "Сизнинг промокодларингиз:",
      myPromoCodesCopyHint: "Промокодни нусхалаш учун тугмани босинг.",
      showMorePromoCodes: "Яна кўрсатиш",
      allPromoCodesShown: "Барча промокодлар кўрсатилди.",
      productLabel: "Маҳсулот",
      priceLabel: "Нархи",
      moneyUnit: "сўм",
      balanceText: "Жорий баланс: {{amount}} сўм",
      withdrawalNoBalance: "Балансингизда ечиб олиш учун маблағ йўқ.",
      enterWithdrawalAmount:
        "Жорий баланс: {{amount}} сўм\n\nКартага ўтказиш учун суммани юборинг. Масалан: 300000",
      invalidWithdrawalAmount: "Суммани тўғри форматда киритинг.",
      withdrawalTooMuch:
        "Киритилган сумма балансингиздан катта. Жорий баланс: {{amount}} сўм",
      enterCardNumber:
        "Карта рақамингизни юборинг. Масалан: 8600 1234 5678 9012",
      withdrawalCreated:
        "Сўровингиз қабул қилинди. Тўлов 24 соат ичида амалга оширилади.",
      actionCanceled: "Амалёт бекор қилинди.",
      contactRequestOnly: "Телефон рақамни тугма орқали юборинг.",
      unknownMenuAction:
        "Керакли бўлимни keyboard тугмалари орқали танланг.",
      paymentReceiptCaption:
        "Ассалому алайкум. {{amount}} сўмлик тўловингиз амалга оширилди.",
      requestOwnContact:
        "Илтимос, айнан ўзингизнинг телефон рақамингизни юборинг.",
      notRegistered: "Аввал рўйхатдан ўтишни якунланг.",
      languageNames: {
        uz: "O'zbekcha",
        ru: "Русский",
        "uz-cyrl": "Ўзбекча"
      }
    }
  }
};

i18next.init({
  resources,
  lng: "uz",
  fallbackLng: "uz",
  initImmediate: false,
  interpolation: {
    escapeValue: false
  }
});

function t(locale, key, options) {
  const language = supportedLocales.includes(locale) ? locale : "uz";
  return i18next.t(key, {
    lng: language,
    ...options
  });
}

function getLanguageButtons() {
  return supportedLocales.map((locale) => ({
    locale,
    label: t(locale, `languageNames.${locale}`)
  }));
}

module.exports = {
  getLanguageButtons,
  supportedLocales,
  t
};
