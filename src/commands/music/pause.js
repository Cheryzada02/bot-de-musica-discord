import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("Pausa la reproducción.");

export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue?.node.isPlaying()) return interaction.reply({ content: "❌ No hay nada reproduciéndose.", ephemeral: true });
  queue.node.pause();
  return interaction.reply("⏸️ Pausado.");
}
