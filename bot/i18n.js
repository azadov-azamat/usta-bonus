const i18next = require("i18next");

const supportedLocales = ["uz", "ru"];
const languageEmojis = {
  uz: "🇺🇿",
  ru: "🇷🇺",
};

const resources = {
  uz: {
    translation: {
      chooseLanguage: "🌐 Iltimos, kerakli tilni tanlang.",
      languageSaved: "✅ Til saqlandi.",
      sharePhone:
        "📱 Registratsiyani tugatish uchun telefon raqamingizni yuboring.",
      contactButton: "📲 Telefon raqamni yuborish",
      registrationDone:
        "🎉 Registratsiya muvaffaqiyatli tugadi. Endi promokodlaringizni kiritishingiz mumkin.",
      mainMenuHint: "🏠 Asosiy menyudan kerakli bo'limni tanlang.",
      activatePromo: "🎟️ Promokodni aktivlashtirish",
      myPromocodes: "🧾 Promokodlarim",
      myBalance: "💰 Balansim",
      withdraw: "💸 Pul yechish",
      settings: "⚙️ Sozlamalar",
      settingsHint: "⚙️ Sozlamalar bo'limidan kerakli amalni tanlang.",
      changeLanguage: "🌐 Tilni o'zgartirish",
      changeCardNumber: "💳 Karta raqamini o'zgartirish",
      back: "⬅️ Orqaga",
      cancel: "❌ Bekor qilish",
      enterPromoCode: "🎟️ Promokodni yuboring.",
      promoActivated:
        "✅ Promokod aktivlashtirildi. Balansingizga {{amount}} so'm qo'shildi.",
      promoNotFound: "❌ Bunday promokod topilmadi.",
      promoAlreadyUsed: "ℹ️ Bu promokod allaqachon ishlatilgan.",
      myPromoCodesEmpty: "📭 Sizda hali aktivlashtirilgan promokodlar yo'q.",
      myPromoCodesTitle: "🧾 Sizning promokodlaringiz:",
      showMorePromoCodes: "➕ Yana ko'rsatish",
      allPromoCodesShown: "✅ Barcha promokodlar ko'rsatildi.",
      productLabel: "🎁 Mahsulot",
      priceLabel: "💵 Narxi",
      moneyUnit: "so'm",
      balanceText: "💰 Joriy balans: {{amount}} so'm",
      withdrawalNoBalance:
        "😕 Balansingizda yechib olish uchun mablag' yo'q.",
      enterWithdrawalAmount:
        "💰 Joriy balans: {{amount}} so'm\n\n💸 Kartaga o'tkazish uchun summani yuboring. Masalan: 300000",
      invalidWithdrawalAmount: "⚠️ Summani to'g'ri formatda kiriting.",
      withdrawalTooMuch:
        "⚠️ Kiritilgan summa balansingizdan katta. Joriy balans: {{amount}} so'm",
      enterCardNumber:
        "💳 Karta raqamingizni yuboring. Masalan: 8600 1234 5678 9012",
      invalidCardNumber:
        "⚠️ Karta raqamini 16 xonali formatda kiriting.",
      confirmCardNumber:
        "💳 Karta raqami: {{cardNumber}}\n\n✅ Agar raqam to'g'ri bo'lsa, tasdiqlang.",
      enterNewCardNumber:
        "💳 Yangi karta raqamingizni yuboring. Masalan: 8600 1234 5678 9012",
      confirmCard: "✅ Tasdiqlash",
      cardSaved: "✅ Karta raqami saqlandi.",
      withdrawalCreated:
        "✅ So'rovingiz qabul qilindi. To'lov 24 soat ichida amalga oshiriladi.",
      actionCanceled: "❌ Amaliyot bekor qilindi.",
      contactRequestOnly: "📱 Telefon raqamni tugma orqali yuboring.",
      unknownMenuAction:
        "👇 Kerakli bo'limni keyboard tugmalari orqali tanlang.",
      paymentReceiptCaption:
        "✅ Assalomu alaykum. {{amount}} so'mlik to'lovingiz amalga oshirildi.",
      requestOwnContact:
        "🔐 Iltimos, aynan o'zingizning telefon raqamingizni yuboring.",
      notRegistered: "ℹ️ Avval registratsiyani yakunlang.",
      helpMessage:
        "❓ Foydali komandalar:\n🚀 /start - asosiy menyuni ochadi\n🆘 /help - yordam oynasini ochadi\n\n📌 Asosiy menyudan promokodni aktivlashtirish, promokodlar ro'yxatini ko'rish, balansni tekshirish, pul yechish va Sozlamalar -> Tilni o'zgartirish bo'limiga o'tishingiz mumkin.",
      languageNames: {
        uz: "O'zbekcha",
        ru: "Русский"
      }
    }
  },
  ru: {
    translation: {
      chooseLanguage: "🌐 Пожалуйста, выберите язык.",
      languageSaved: "✅ Язык сохранен.",
      sharePhone: "📱 Для завершения регистрации отправьте номер телефона.",
      contactButton: "📲 Отправить номер телефона",
      registrationDone:
        "🎉 Регистрация успешно завершена. Теперь можете активировать промокоды.",
      mainMenuHint: "🏠 Выберите нужный раздел из главного меню.",
      activatePromo: "🎟️ Активировать промокод",
      myPromocodes: "🧾 Мои промокоды",
      myBalance: "💰 Мой баланс",
      withdraw: "💸 Вывод средств",
      settings: "⚙️ Настройки",
      settingsHint: "⚙️ Выберите нужное действие в разделе настроек.",
      changeLanguage: "🌐 Сменить язык",
      changeCardNumber: "💳 Изменить номер карты",
      back: "⬅️ Назад",
      cancel: "❌ Отмена",
      enterPromoCode: "🎟️ Отправьте промокод.",
      promoActivated:
        "✅ Промокод активирован. На баланс начислено {{amount}} сум.",
      promoNotFound: "❌ Такой промокод не найден.",
      promoAlreadyUsed: "ℹ️ Этот промокод уже использован.",
      myPromoCodesEmpty: "📭 У вас пока нет активированных промокодов.",
      myPromoCodesTitle: "🧾 Ваши промокоды:",
      showMorePromoCodes: "➕ Показать еще",
      allPromoCodesShown: "✅ Все промокоды уже показаны.",
      productLabel: "🎁 Товар",
      priceLabel: "💵 Цена",
      moneyUnit: "сум",
      balanceText: "💰 Текущий баланс: {{amount}} сум",
      withdrawalNoBalance: "😕 На балансе нет средств для вывода.",
      enterWithdrawalAmount:
        "💰 Текущий баланс: {{amount}} сум\n\n💸 Отправьте сумму для перевода на карту. Например: 300000",
      invalidWithdrawalAmount: "⚠️ Введите сумму в правильном формате.",
      withdrawalTooMuch:
        "⚠️ Указанная сумма больше вашего баланса. Текущий баланс: {{amount}} сум",
      enterCardNumber:
        "💳 Отправьте номер карты. Например: 8600 1234 5678 9012",
      invalidCardNumber:
        "⚠️ Введите номер карты в формате из 16 цифр.",
      confirmCardNumber:
        "💳 Номер карты: {{cardNumber}}\n\n✅ Если номер указан верно, подтвердите.",
      enterNewCardNumber:
        "💳 Отправьте новый номер карты. Например: 8600 1234 5678 9012",
      confirmCard: "✅ Подтвердить",
      cardSaved: "✅ Номер карты сохранен.",
      withdrawalCreated:
        "✅ Заявка принята. Перевод будет выполнен в течение 24 часов.",
      actionCanceled: "❌ Операция отменена.",
      contactRequestOnly: "📱 Отправьте номер телефона через кнопку.",
      unknownMenuAction: "👇 Выберите нужный раздел кнопками клавиатуры.",
      paymentReceiptCaption:
        "✅ Здравствуйте. Ваш перевод на сумму {{amount}} сум выполнен.",
      requestOwnContact:
        "🔐 Пожалуйста, отправьте именно свой номер телефона.",
      notRegistered: "ℹ️ Сначала завершите регистрацию.",
      helpMessage:
        "❓ Полезные команды:\n🚀 /start - открыть главное меню\n🆘 /help - открыть справку\n\n📌 В главном меню можно активировать промокод, посмотреть список промокодов, проверить баланс, вывести средства и открыть Настройки -> Сменить язык.",
      languageNames: {
        uz: "O'zbekcha",
        ru: "Русский"
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

function getLanguageLabel(locale) {
  return (
    resources[locale]?.translation?.languageNames?.[locale] ||
    resources.uz.translation.languageNames[locale] ||
    locale
  );
}

function getLanguageButtons() {
  return supportedLocales.map((locale) => ({
    locale,
    label: `${languageEmojis[locale]} ${getLanguageLabel(locale)}`,
  }));
}

module.exports = {
  getLanguageButtons,
  getLanguageLabel,
  supportedLocales,
  t
};
