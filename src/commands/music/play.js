import { SlashCommandBuilder, ChannelType } from "discord.js";
import { useMainPlayer, QueryType } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Reproduce una canción o playlist por nombre o URL (YouTube/Spotify/Apple/SC).")
  .addStringOption(o => o.setName("query").setDescription("Texto o URL").setRequired(true))
  .addChannelOption(o => o.setName("canal").setDescription("Canal de voz").addChannelTypes(ChannelType.GuildVoice))
  .setDMPermission(false);

export async function execute(interaction) {
  const player = useMainPlayer();
  const query = interaction.options.getString("query", true);
  const voice = interaction.options.getChannel("canal") ?? interaction.member?.voice?.channel;

  if (!voice || voice.type !== ChannelType.GuildVoice) {
    return interaction.reply({ content: "🔊 Debes estar en un canal de voz o especificar uno.", ephemeral: true });
  }

  await interaction.deferReply();

  const res = await player.play(voice, query, {
    nodeOptions: {
      metadata: { channel: interaction.channel, requestedBy: interaction.user },
      volume: 15
    },
    requestedBy: interaction.user,
    searchEngine: QueryType.AUTO
  });

  const track = res.track ?? res.tracks?.[0];
  if (!track) return interaction.editReply("❌ No se encontraron resultados.");
  await interaction.editReply(`▶️ **${track.title}** — ${track.author ?? "Desconocido"}\n${track.url ?? query}`);
}
