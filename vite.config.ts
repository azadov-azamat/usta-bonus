import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const backendPort = process.env.PORT || "3000";

export default defineConfig({
  root: path.resolve(__dirname, "frontend"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "frontend/src")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": `http://localhost:${backendPort}`,
      "/uploads": `http://localhost:${backendPort}`
    }
  },
  build: {
    outDir: path.resolve(__dirname, "frontend-dist"),
    emptyOutDir: true
  }
});
