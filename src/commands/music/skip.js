import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Salta a la siguiente canción.");

export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue?.currentTrack) return interaction.reply({ content: "❌ No hay nada reproduciéndose.", ephemeral: true });
  queue.node.skip();
  return interaction.reply("⏭️ Siguiente!");
}
