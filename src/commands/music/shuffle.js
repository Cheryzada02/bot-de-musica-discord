import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("shuffle")
  .setDescription("Mezcla la cola.");

export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue?.tracks?.size) return interaction.reply({ content: "❌ La cola está vacía.", ephemeral: true });
  queue.tracks.shuffle();
  return interaction.reply("🔀 Cola mezclada.");
}
