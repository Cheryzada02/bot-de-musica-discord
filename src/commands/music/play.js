import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from "discord.js";
import { useMainPlayer, QueryType } from "discord-player";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Reproduce una canción o playlist por nombre o URL (YouTube/Spotify/Apple/SC).")
  .addStringOption(o => o.setName("cancion").setDescription("Nombre o URL de la canción").setRequired(true))
  .setDMPermission(false);

function findStringOption(options, preferredNames) {
  for (const name of preferredNames) {
    const match = options.find((option) => option.name === name && typeof option.value === "string");
    if (match) return match.value.trim();
  }

  for (const option of options) {
    if (Array.isArray(option.options)) {
      const nestedValue = findStringOption(option.options, preferredNames);
      if (nestedValue) return nestedValue;
    }
  }

  const stringOption = options.find((option) => typeof option.value === "string");
  if (stringOption) return stringOption.value.trim();

  for (const option of options) {
    if (Array.isArray(option.options)) {
      const nestedValue = findStringOption(option.options, []);
      if (nestedValue) return nestedValue;
    }
  }

  return "";
}

export async function execute(interaction) {
  const player = useMainPlayer();
  const voice = interaction.guild?.voiceStates.cache.get(interaction.user.id)?.channel;

  if (!voice || voice.type !== ChannelType.GuildVoice) {
    return interaction.reply({
      content: "🔊 Primero debes conectarte a un canal de voz para poner música.",
      ephemeral: true,
    });
  }

  const botMember = interaction.guild.members.me;
  const permissions = botMember && voice.permissionsFor(botMember);
  if (!permissions?.has([
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
  ])) {
    return interaction.reply({
      content: "❌ No tengo permiso para ver, conectarme o hablar en ese canal de voz.",
      ephemeral: true,
    });
  }

  const query = findStringOption(interaction.options.data, ["cancion", "query", "song", "music", "url", "search"]);
  if (!query) {
    console.warn("Comando /play sin texto de búsqueda. Opciones recibidas:", interaction.options.data.map((option) => ({
      name: option.name,
      type: option.type,
      nestedNames: option.options?.map((nestedOption) => nestedOption.name) ?? [],
    })));
    return interaction.reply({
      content: "🎵 No recibí ninguna canción. Vuelve a ejecutar `/play` y completa el campo `cancion` con el nombre o la URL.",
      ephemeral: true,
    });
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
