import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { useQueue } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("nowplaying")
  .setDescription("Muestra la canción actual.");

export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  const track = queue?.currentTrack;
  if (!track) return interaction.reply({ content: "❌ No hay nada reproduciéndose.", ephemeral: true });

  const progress = queue.node.createProgressBar();
  const embed = new EmbedBuilder()
    .setTitle("🎵 Reproduciendo ahora")
    .setDescription(`[${track.title}](${track.url})\n${progress}`)
    .addFields(
      { name: "Solicitada por", value: `<@${track.requestedBy?.id ?? "?"}>`, inline: true },
      { name: "Autor", value: track.author ?? "Desconocido", inline: true }
    );

  return interaction.reply({ embeds: [embed] });
}
