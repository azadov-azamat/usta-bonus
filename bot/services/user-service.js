const { User } = require("../../models");
const {
  isValidCardNumber,
  normalizeCardNumber,
} = require("../utils/card-number");
const {
  isValidPersonName,
  normalizePersonName,
} = require("../utils/person-name");
const { isKnownLocale, normalizeLocale } = require("../utils/locale");

const REGISTRATION_STATUSES = {
  AWAITING_PHONE: "awaiting_phone",
  AWAITING_PHOTO: "awaiting_photo",
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
};

function hasSelectedLanguage(user) {
  return Boolean(user?.languageSelected) && isKnownLocale(user.language);
}

function hasPhoneNumber(user) {
  return Boolean(String(user?.phoneNumber || "").trim());
}

function hasEnteredFirstName(user) {
  return Boolean(String(user?.enteredFirstName || "").trim());
}

function hasEnteredLastName(user) {
  return Boolean(String(user?.enteredLastName || "").trim());
}

function hasEnteredFullName(user) {
  return hasEnteredFirstName(user) && hasEnteredLastName(user);
}

function getDisplayFirstName(user) {
  return (
    String(user?.enteredFirstName || "").trim() ||
    String(user?.firstName || "").trim() ||
    null
  );
}

function getDisplayLastName(user) {
  return (
    String(user?.enteredLastName || "").trim() ||
    String(user?.lastName || "").trim() ||
    null
  );
}

function getSavedWithdrawalCard(user) {
  const normalizedCardNumber = normalizeCardNumber(user?.withdrawalCardNumber);
  return isValidCardNumber(normalizedCardNumber) ? normalizedCardNumber : null;
}

function hasSavedWithdrawalCard(user) {
  return Boolean(getSavedWithdrawalCard(user));
}

function hasAdminReviewedRegistration(user) {
  if (user?.role === "admin") {
    return true;
  }

  return Boolean(user?.registrationReviewedByAdmin);
}

function getRegistrationStatus(user) {
  if (user?.role === "admin") {
    return REGISTRATION_STATUSES.APPROVED;
  }

  const status = String(user?.registrationStatus || "").trim();

  if (
    status === REGISTRATION_STATUSES.APPROVED &&
    hasAdminReviewedRegistration(user)
  ) {
    return status;
  }

  if (
    status === REGISTRATION_STATUSES.PENDING_REVIEW ||
    (user?.registrationPhotoSubmittedAt && user?.registrationPhotoFileId)
  ) {
    return REGISTRATION_STATUSES.PENDING_REVIEW;
  }

  if (hasSelectedLanguage(user) && hasPhoneNumber(user)) {
    return REGISTRATION_STATUSES.AWAITING_PHOTO;
  }

  return REGISTRATION_STATUSES.AWAITING_PHONE;
}

function isUserApproved(user) {
  return getRegistrationStatus(user) === REGISTRATION_STATUSES.APPROVED;
}

function isPendingRegistrationApproval(user) {
  return (
    getRegistrationStatus(user) === REGISTRATION_STATUSES.PENDING_REVIEW
  );
}

function isAwaitingRegistrationPhoto(user) {
  return (
    getRegistrationStatus(user) === REGISTRATION_STATUSES.AWAITING_PHOTO
  );
}

function syncRegistrationStatus(user) {
  user.isRegistered =
    hasSelectedLanguage(user) &&
    hasEnteredFullName(user) &&
    hasPhoneNumber(user);

  if (user.role === "admin") {
    user.registrationStatus = REGISTRATION_STATUSES.APPROVED;
    user.registrationReviewedByAdmin = true;
    user.approvedAt = user.approvedAt || new Date();
    return;
  }

  if (!user.isRegistered) {
    user.registrationStatus = REGISTRATION_STATUSES.AWAITING_PHONE;
    user.registrationReviewedByAdmin = false;
    user.registrationPhotoFileId = null;
    user.registrationPhotoUniqueFileId = null;
    user.registrationPhotoData = null;
    user.registrationPhotoMimeType = null;
    user.registrationPhotoName = null;
    user.registrationPhotoSubmittedAt = null;
    user.approvedAt = null;
    return;
  }

  const currentStatus = getRegistrationStatus(user);

  if (
    currentStatus === REGISTRATION_STATUSES.PENDING_REVIEW ||
    (currentStatus === REGISTRATION_STATUSES.APPROVED &&
      hasAdminReviewedRegistration(user))
  ) {
    user.registrationStatus = currentStatus;
    return;
  }

  user.registrationStatus = REGISTRATION_STATUSES.AWAITING_PHOTO;
  user.registrationReviewedByAdmin = false;
}

async function ensureTelegramUser(ctx) {
  const telegramId = String(ctx.from.id);
  const chatId = ctx.chat?.id ? String(ctx.chat.id) : null;

  const [user] = await User.findOrCreate({
    where: { telegramId },
    defaults: {
      role: "worker",
      telegramId,
      chatId,
      username: ctx.from.username || null,
      firstName: ctx.from.first_name || null,
      lastName: ctx.from.last_name || null,
      enteredFirstName: null,
      enteredLastName: null,
      languageSelected: false,
      isRegistered: false,
      registrationStatus: REGISTRATION_STATUSES.AWAITING_PHONE,
      registrationReviewedByAdmin: false,
    },
  });

  user.chatId = chatId || user.chatId || null;
  user.username = ctx.from.username || user.username || null;
  user.firstName = ctx.from.first_name || user.firstName || null;
  user.lastName = ctx.from.last_name || user.lastName || null;
  user.language = normalizeLocale(user.language);
  syncRegistrationStatus(user);
  await user.save();

  return user;
}

async function setUserLanguage(user, locale) {
  user.language = normalizeLocale(locale);
  user.languageSelected = true;
  syncRegistrationStatus(user);
  await user.save();
  return user;
}

async function setUserEnteredFirstName(user, firstName) {
  const normalizedName = normalizePersonName(firstName);

  if (!isValidPersonName(normalizedName)) {
    throw new Error("Ism noto'g'ri formatda.");
  }

  user.enteredFirstName = normalizedName;
  syncRegistrationStatus(user);
  await user.save();
  return user;
}

async function setUserEnteredLastName(user, lastName) {
  const normalizedName = normalizePersonName(lastName);

  if (!isValidPersonName(normalizedName)) {
    throw new Error("Familiya noto'g'ri formatda.");
  }

  user.enteredLastName = normalizedName;
  syncRegistrationStatus(user);
  await user.save();
  return user;
}

async function setUserPhoneNumber(user, phoneNumber) {
  user.phoneNumber = phoneNumber || user.phoneNumber;
  syncRegistrationStatus(user);
  await user.save();
  return user;
}

async function submitUserRegistrationPhoto(user, photo) {
  user.registrationPhotoFileId = photo?.fileId || null;
  user.registrationPhotoUniqueFileId = photo?.uniqueFileId || null;
  user.registrationPhotoData = photo?.buffer || null;
  user.registrationPhotoMimeType = photo?.mimeType || null;
  user.registrationPhotoName = photo?.filename || null;
  user.registrationPhotoSubmittedAt = new Date();
  user.registrationStatus = REGISTRATION_STATUSES.PENDING_REVIEW;
  user.registrationReviewedByAdmin = false;
  user.approvedAt = null;
  user.isRegistered = hasSelectedLanguage(user) && hasPhoneNumber(user);
  await user.save();
  return user;
}

async function approveTelegramUser(user) {
  user.registrationStatus = REGISTRATION_STATUSES.APPROVED;
  user.registrationReviewedByAdmin = true;
  user.approvedAt = new Date();
  user.isRegistered = hasSelectedLanguage(user) && hasPhoneNumber(user);
  await user.save();
  return user;
}

async function requestRegistrationPhotoRetry(user) {
  user.registrationStatus = REGISTRATION_STATUSES.AWAITING_PHOTO;
  user.registrationReviewedByAdmin = false;
  user.registrationPhotoFileId = null;
  user.registrationPhotoUniqueFileId = null;
  user.registrationPhotoData = null;
  user.registrationPhotoMimeType = null;
  user.registrationPhotoName = null;
  user.registrationPhotoSubmittedAt = null;
  user.approvedAt = null;
  user.isRegistered = hasSelectedLanguage(user) && hasPhoneNumber(user);
  await user.save();
  return user;
}

async function setAdminChatId(user, chatId) {
  user.adminChatId = chatId || user.adminChatId || null;
  await user.save();
  return user;
}

async function setUserWithdrawalCard(user, cardNumber) {
  const normalizedCardNumber = normalizeCardNumber(cardNumber);

  if (!isValidCardNumber(normalizedCardNumber)) {
    throw new Error("Karta raqami noto'g'ri.");
  }

  user.withdrawalCardNumber = normalizedCardNumber;
  await user.save();
  return user;
}

module.exports = {
  approveTelegramUser,
  ensureTelegramUser,
  getDisplayFirstName,
  getDisplayLastName,
  getSavedWithdrawalCard,
  getRegistrationStatus,
  hasEnteredFirstName,
  hasEnteredFullName,
  hasEnteredLastName,
  hasPhoneNumber,
  hasSavedWithdrawalCard,
  hasSelectedLanguage,
  isAwaitingRegistrationPhoto,
  isPendingRegistrationApproval,
  isUserApproved,
  REGISTRATION_STATUSES,
  requestRegistrationPhotoRetry,
  setAdminChatId,
  setUserEnteredFirstName,
  setUserEnteredLastName,
  setUserLanguage,
  setUserPhoneNumber,
  submitUserRegistrationPhoto,
  setUserWithdrawalCard,
  syncRegistrationStatus,
};
