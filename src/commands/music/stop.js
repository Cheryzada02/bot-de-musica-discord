import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Detiene la reproducción y limpia la cola.");

export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue) return interaction.reply({ content: "❌ No hay cola activa.", ephemeral: true });
  queue.delete();
  return interaction.reply("⏹️ Reproductor detenido y cola limpiada.");
}
