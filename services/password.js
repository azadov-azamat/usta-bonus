const { randomBytes, scryptSync, timingSafeEqual } = require("node:crypto");

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

function generateSalt() {
  return randomBytes(SALT_LENGTH).toString("hex");
}

function hashPassword(password, salt) {
  return scryptSync(String(password), String(salt), KEY_LENGTH).toString("hex");
}

function createPasswordDigest(password) {
  const salt = generateSalt();
  const hash = hashPassword(password, salt);

  return {
    salt,
    hash
  };
}

function verifyPassword(password, salt, expectedHash) {
  if (!password || !salt || !expectedHash) {
    return false;
  }

  const actualHash = hashPassword(password, salt);
  const actualBuffer = Buffer.from(actualHash, "hex");
  const expectedBuffer = Buffer.from(String(expectedHash), "hex");

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

module.exports = {
  createPasswordDigest,
  verifyPassword
};
