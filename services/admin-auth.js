const { createHmac, timingSafeEqual } = require("node:crypto");

const ADMIN_AUTH_COOKIE_NAME = "turon_admin_session";

function getAuthSecret() {
  return process.env.ADMIN_AUTH_SECRET || process.env.BOT_TOKEN || "development-secret";
}

function createSignature(payload) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
}

function createSessionToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      userId: user.id,
      role: user.role,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7
    })
  ).toString("base64url");

  const signature = createSignature(payload);
  return `${payload}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payload, signature] = token.split(".");
  const expectedSignature = createSignature(payload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(signature || "");

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    if (!session.exp || Date.now() > session.exp) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function parseCookies(headerValue) {
  return String(headerValue || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, item) => {
      const [key, ...rest] = item.split("=");
      accumulator[key] = decodeURIComponent(rest.join("="));
      return accumulator;
    }, {});
}

function setAdminSessionCookie(res, token) {
  const parts = [
    `${ADMIN_AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 24 * 7}`
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearAdminSessionCookie(res) {
  const parts = [
    `${ADMIN_AUTH_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  res.setHeader("Set-Cookie", parts.join("; "));
}

module.exports = {
  ADMIN_AUTH_COOKIE_NAME,
  clearAdminSessionCookie,
  createSessionToken,
  parseCookies,
  setAdminSessionCookie,
  verifySessionToken
};
