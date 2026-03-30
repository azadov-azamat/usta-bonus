const { t } = require("../i18n");
const {
  promptForFirstName,
  promptForLastName,
  promptForLanguage,
  promptForPhone,
  showPendingApprovalMessage,
} = require("../services/menu-service");
const {
  hasEnteredFirstName,
  hasEnteredLastName,
  hasPhoneNumber,
  hasSelectedLanguage,
  isUserApproved,
  submitUserRegistrationPhoto,
} = require("../services/user-service");
const {
  notifyAdminsAboutRegistrationReview,
} = require("../services/admin-notification-service");
const {
  downloadTelegramFileBuffer,
} = require("../services/telegram-file-service");
const { getSessionState, resetNavigation } = require("../state/navigation");
const { getUserLocale } = require("../utils/locale");
const { Markup } = require("telegraf");

function resolvePhotoPayload(ctx) {
  const photos = ctx.message?.photo;

  if (Array.isArray(photos) && photos.length > 0) {
    const photo = photos[photos.length - 1];
    return {
      fileId: photo.file_id,
      uniqueFileId: photo.file_unique_id,
      mimeType: "image/jpeg",
      filename: `registration-${Date.now()}.jpg`,
    };
  }

  const document = ctx.message?.document;

  if (String(document?.mime_type || "").startsWith("image/")) {
    return {
      fileId: document.file_id,
      uniqueFileId: document.file_unique_id,
      mimeType: document.mime_type || "application/octet-stream",
      filename: document.file_name || `registration-${Date.now()}`,
    };
  }

  return null;
}

async function handlePhoto(ctx) {
  const user = ctx.state.user;
  const locale = getUserLocale(user);
  const photo = resolvePhotoPayload(ctx);

  if (!hasSelectedLanguage(user)) {
    await promptForLanguage(ctx, { replace: true });
    return;
  }

  if (!hasEnteredFirstName(user)) {
    await promptForFirstName(ctx, user, { replace: true });
    return;
  }

  if (!hasEnteredLastName(user)) {
    await promptForLastName(ctx, user, { replace: true });
    return;
  }

  if (!hasPhoneNumber(user)) {
    await promptForPhone(ctx, user, { replace: true });
    return;
  }

  if (isUserApproved(user)) {
    await ctx.reply(t(locale, "unknownMenuAction"));
    return;
  }

  if (!photo?.fileId) {
    await ctx.reply(
      t(locale, "profilePhotoOnly"),
      Markup.removeKeyboard(),
    );
    return;
  }

  const fileBuffer = await downloadTelegramFileBuffer(ctx.telegram, photo.fileId);

  await submitUserRegistrationPhoto(user, {
    ...photo,
    buffer: fileBuffer,
  });
  resetNavigation(getSessionState(ctx));

  try {
    await notifyAdminsAboutRegistrationReview(ctx.telegram, user);
  } catch (error) {
    console.error("Admin botga registratsiya so'rovi yuborilmadi:", error);
  }

  await ctx.reply(
    t(locale, "registrationPhotoReceived"),
    Markup.removeKeyboard(),
  );
  // await showPendingApprovalMessage(ctx, user, { replace: true });
}

module.exports = handlePhoto;
