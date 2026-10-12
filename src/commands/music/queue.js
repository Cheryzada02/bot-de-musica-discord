import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("Muestra las próximas canciones (hasta 10).");

export async function execute(interaction) {
  const queue = useQueue(interaction.guildId);
  if (!queue?.tracks || queue.tracks.size === 0) {
    return interaction.reply({ content: "🕳️ La cola está vacía.", ephemeral: true });
  }
  const lines = queue.tracks.toArray().slice(0, 10).map((t, i) => `${i + 1}. ${t.title} — ${t.author ?? "Desconocido"}`);
  return interaction.reply(`📜 **Cola (próximas 10):**\n${lines.join("\n")}`);
}
