import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("volume")
  .setDescription("Ajusta el volumen (0-100).")
  .addIntegerOption(o => o.setName("valor").setDescription("Volumen 0-100").setMinValue(0).setMaxValue(100).setRequired(true));

export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue?.node.isPlaying()) return interaction.reply({ content: "❌ No hay nada reproduciéndose.", ephemeral: true });
  const v = interaction.options.getInteger("valor", true);
  queue.node.setVolume(v);
  return interaction.reply(`🔊 Volumen ajustado a **${v}%**`);
}
