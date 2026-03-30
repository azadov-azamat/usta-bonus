const PAGES = {
  LANGUAGE: "language",
  REGISTRATION_FIRST_NAME: "registration_first_name",
  REGISTRATION_LAST_NAME: "registration_last_name",
  CONTACT: "contact",
  REGISTRATION_PHOTO: "registration_photo",
  REGISTRATION_PENDING: "registration_pending",
  MAIN_MENU: "main_menu",
  SETTINGS: "settings",
  SETTINGS_LANGUAGE: "settings_language",
  PROMO_INPUT: "promo_input",
  PROMO_LIST: "promo_list",
  BALANCE: "balance",
  WITHDRAWAL_AMOUNT: "withdrawal_amount",
  WITHDRAWAL_CARD: "withdrawal_card",
  SETTINGS_CARD: "settings_card",
  CARD_CONFIRM: "card_confirm",
};

function getSessionState(ctx) {
  if (!ctx.session) {
    ctx.session = {};
  }

  if (!Array.isArray(ctx.session.pageHistory)) {
    ctx.session.pageHistory = [];
  }

  return ctx.session;
}

function clearFlowState(sessionState) {
  sessionState.step = null;
  sessionState.withdrawalAmount = null;
  sessionState.pendingWithdrawalCard = null;
  sessionState.cardFlowType = null;
}

function setCurrentPage(sessionState, page, options = {}) {
  const { replace = false } = options;

  if (!replace && sessionState.pageKey && sessionState.pageKey !== page) {
    sessionState.pageHistory.push(sessionState.pageKey);
  }

  sessionState.pageKey = page;
}

function goBack(sessionState, fallbackPage = PAGES.MAIN_MENU) {
  const previousPage = sessionState.pageHistory.pop() || fallbackPage;
  sessionState.pageKey = previousPage;
  return previousPage;
}

function resetNavigation(sessionState, page = PAGES.MAIN_MENU) {
  sessionState.pageHistory = [];
  sessionState.pageKey = page;
  clearFlowState(sessionState);
}

module.exports = {
  PAGES,
  clearFlowState,
  getSessionState,
  goBack,
  resetNavigation,
  setCurrentPage,
};
