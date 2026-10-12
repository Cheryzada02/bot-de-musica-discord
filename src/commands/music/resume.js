import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("resume")
  .setDescription("Reanuda la reproducción.");

export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue?.node.isPaused()) return interaction.reply({ content: "ℹ️ No está pausado.", ephemeral: true });
  queue.node.resume();
  return interaction.reply("▶️ Reanudado.");
}
