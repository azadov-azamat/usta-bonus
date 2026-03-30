async function downloadTelegramFileBuffer(telegram, fileId) {
  if (!telegram || !fileId) {
    throw new Error("Telegram faylini yuklab bo'lmadi.");
  }

  const fileUrl = await telegram.getFileLink(fileId);
  const response = await fetch(fileUrl.toString());

  if (!response.ok) {
    throw new Error(`Telegram fayli yuklanmadi: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

module.exports = {
  downloadTelegramFileBuffer,
};
