import { logger } from "../utils/logger.js";

export default {
  name: "interactionCreate",
  async execute(interaction) {
    try {
      if (!interaction.isChatInputCommand()) return;
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
    } catch (e) {
      logger.error("interaction error:", e);
      if (interaction.isRepliable()) {
        const content = "❌ Ocurrió un error ejecutando el comando.";
        if (interaction.deferred || interaction.replied) await interaction.followUp({ content, ephemeral: true });
        else await interaction.reply({ content, ephemeral: true });
      }
    }
  }
};
