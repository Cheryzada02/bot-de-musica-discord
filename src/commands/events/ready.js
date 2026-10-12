import { logger } from "../utils/logger.js";

export default {
  name: "ready",
  once: true,
  execute(client) {
    logger.info(`Bot listo como ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: "/play musica", type: 2 /* LISTENING */ }],
      status: "online"
    });
  }
};
