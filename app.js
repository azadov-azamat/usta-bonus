require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const adminRoutes = require("./routes");
const { bot, getWebhookPath, getWebhookUrl } = require("./bot");

const app = express();
const webhookPath = getWebhookPath();
const frontendBuildPath = path.join(__dirname, "..", "frontend", "out");
const frontendIndexPath = path.join(frontendBuildPath, "index.html");
const hasFrontendBuild = fs.existsSync(frontendIndexPath);
const allowedCorsOrigins = new Set(
  [
    "https://usta-bonus.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
    process.env.CORS_ALLOWED_ORIGINS,
  ]
    .flatMap((value) => String(value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean),
);

function corsOriginHandler(origin, callback) {
  if (!origin) {
    callback(null, true);
    return;
  }

  callback(null, allowedCorsOrigins.has(origin));
}

app.disable("x-powered-by");
app.use(
  cors({
    credentials: true,
    origin: corsOriginHandler,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "turon-bot",
    mode: process.env.NODE_ENV === "production" ? "webhook" : "polling",
    webhookPath,
    adminPanel: hasFrontendBuild ? "/admin" : null,
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "turon-bot",
    mode: "webhook",
    webhookPath,
    webhookUrl: getWebhookUrl(),
  });
});

app.use(bot.webhookCallback(webhookPath));

if (hasFrontendBuild) {
  app.use("/admin", express.static(frontendBuildPath));
}

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Route topilmadi.",
  });
});

app.use((error, req, res, next) => {
  console.error("Express xatoligi:", error);
  res.status(500).json({
    ok: false,
    message: "Server xatoligi yuz berdi.",
  });
});

module.exports = app;
