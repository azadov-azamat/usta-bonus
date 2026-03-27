const PAGES = {
  LANGUAGE: "language",
  CONTACT: "contact",
  MAIN_MENU: "main_menu",
  PROMO_INPUT: "promo_input",
  PROMO_LIST: "promo_list",
  BALANCE: "balance",
  WITHDRAWAL_AMOUNT: "withdrawal_amount",
  WITHDRAWAL_CARD: "withdrawal_card",
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
