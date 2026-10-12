import "dotenv/config";
import { Client, Collection, GatewayIntentBits, REST, Routes, ActivityType } from "discord.js";
import { Player } from "discord-player";
import { DefaultExtractors, SpotifyExtractor } from "@discord-player/extractor";
import { YoutubeExtractor } from "discord-player-youtubei";
import { readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { startAutoPing } from "./commands/utils/autoping.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const textChannelId = process.env.DISCORD_TEXT_CHANNEL_ID;

if (!token || !clientId || !guildId || !textChannelId) {
  throw new Error("DISCORD_TOKEN, CLIENT_ID, GUILD_ID y DISCORD_TEXT_CHANNEL_ID son obligatorios.");
}

if (!/^\d+$/.test(textChannelId)) {
  throw new Error("DISCORD_TEXT_CHANNEL_ID debe ser un ID de canal válido de Discord.");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

const player = new Player(client);
await player.extractors.loadMulti(
  DefaultExtractors.filter((extractor) => extractor !== SpotifyExtractor),
);

if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
  await player.extractors.register(SpotifyExtractor, {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });
} else {
  console.warn("SPOTIFY_CLIENT_ID/SECRET no definidos; la búsqueda por Spotify queda deshabilitada.");
}

await player.extractors.register(YoutubeExtractor, {});
console.log("✅ Extractores de música cargados.");

player.events.on("error", (error) => {
  console.error("❌ Error del reproductor:", error);
});

player.events.on("playerStart", (queue, track) => {
  console.log(`▶️ Reproduciendo en YouTube: ${track.title} (servidor ${queue.guild.id}).`);
});

player.events.on("playerError", (queue, error, track) => {
  console.error(`❌ No se pudo transmitir "${track.title}":`, error);
  const channel = queue.metadata?.channel;
  if (channel?.isTextBased()) {
    channel.send(`❌ No se pudo reproducir **${track.title}** desde YouTube. Intenta con otra canción o URL.`)
      .catch((sendError) => console.error("No se pudo avisar del error de reproducción:", sendError));
  }
});

function findCommandFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) return findCommandFiles(filePath);
    return entry.name.endsWith(".js") ? [filePath] : [];
  });
}

const commands = [];
for (const filePath of findCommandFiles(join(__dirname, "commands"))) {
  const command = await import(pathToFileURL(filePath).href);
  if (!command.data || typeof command.execute !== "function") continue;
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

if (commands.length === 0) {
  throw new Error("No se encontraron comandos válidos en src/commands.");
}
console.log(`✅ ${commands.length} comandos cargados.`);

const rest = new REST({ version: "10" }).setToken(token);
try {
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  console.log(`✅ ${commands.length} comandos registrados en el servidor ${guildId}.`);
} catch (error) {
  console.error("❌ Error al registrar comandos slash:", error);
}

client.once("ready", () => {
  console.log(`🤖 Conectado como ${client.user.tag}`);
  client.user.setActivity({
    name: "/play 🎵 | Tu música favorita",
    type: ActivityType.Listening,
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.channelId !== textChannelId) {
    await interaction.reply({
      content: "❌ Los comandos de música solo se pueden usar en el canal configurado.",
      ephemeral: true,
    });
    return;
  }

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({ content: "❌ Comando no encontrado.", ephemeral: true });
    return;
  }

  try {
    await player.context.provide({ guild: interaction.guild }, () => command.execute(interaction));
  } catch (error) {
    console.error(`❌ Error en comando ${interaction.commandName}:`, error);
    if (!interaction.isRepliable()) return;

    const response = { content: "⚠️ Ocurrió un error al ejecutar el comando.", ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(response);
    } else {
      await interaction.reply(response);
    }
  }
});

await client.login(token);
startAutoPing();
