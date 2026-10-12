import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("Elimina una canción de la cola por posición.")
  .addIntegerOption(o => o.setName("pos").setDescription("Posición en la cola (desde 1)").setMinValue(1).setRequired(true));

export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue?.tracks?.size) return interaction.reply({ content: "❌ La cola está vacía.", ephemeral: true });
  const pos = interaction.options.getInteger("pos", true);
  const arr = queue.tracks.toArray();
  if (pos > arr.length) return interaction.reply({ content: "❌ Posición fuera de rango.", ephemeral: true });
  const [removed] = arr.splice(pos - 1, 1);
  queue.tracks.clear();
  queue.addTrack(arr);
  return interaction.reply(`🗑️ Eliminada **${removed.title}** de la cola.`);
}
