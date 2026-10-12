import express from "express";
import { logger } from "./logger.js";

export function startAutoPing() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.get("/", (_req, res) => res.status(200).send("OK - Music bot up"));

  const server = app.listen(port, () => {
    logger.info(`Web keep-alive on http://localhost:${port}`);
  });

  // Render expone RENDER_EXTERNAL_URL (https://service.onrender.com)
  const baseUrl = process.env.RENDER_EXTERNAL_URL;
  if (!baseUrl) {
    logger.warn("RENDER_EXTERNAL_URL no definido (local/dev). Autoping local deshabilitado.");
    return { app, server };
  }

  const target = `${baseUrl}/`;
  const intervalMs = 1000 * 60 * 4; // cada 4 minutos
  setInterval(async () => {
    try {
      await fetch(target, { method: "GET" });
      logger.debug(`Autoping -> ${target}`);
    } catch (e) {
      logger.warn("Autoping falló:", e?.message ?? e);
    }
  }, intervalMs);

  return { app, server };
}
