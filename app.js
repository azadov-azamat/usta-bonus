require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const adminRoutes = require("./routes/admin");
const { bot, getWebhookPath, getWebhookUrl } = require("./bot");

const app = express();
const webhookPath = getWebhookPath();
const frontendBuildPath = path.join(__dirname, "frontend-dist");
const frontendIndexPath = path.join(frontendBuildPath, "index.html");
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

app.disable("x-powered-by");
app.use(
  cors({
    credentials: true,
    origin: true
  })
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
  app.get("/admin/*", (req, res) => {
    res.sendFile(frontendIndexPath);
  });
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
