import "dotenv/config";
import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

async function collectCommands() {
  const baseDir = join(process.cwd(), "src", "commands");
  const stack = [baseDir];
  const files = [];

  while (stack.length) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith(".js")) files.push(full);
    }
  }

  const commands = [];
  for (const f of files) {
    // ✅ convertir ruta absoluta de Windows a file:// URL
    const mod = await import(pathToFileURL(f).href);
    if (mod?.data) commands.push(mod.data.toJSON());
  }
  return commands;
}

async function main() {
  const scopeIdx = process.argv.indexOf("--scope");
  const scope = scopeIdx !== -1 ? (process.argv[scopeIdx + 1] || "guild") : "guild";

  const { DISCORD_TOKEN: token, CLIENT_ID: clientId, GUILD_ID: guildId } = process.env;
  if (!token) throw new Error("DISCORD_TOKEN requerido");
  if (!clientId) throw new Error("CLIENT_ID requerido");
  if (scope === "guild" && !guildId) throw new Error("GUILD_ID requerido para registro por servidor");

  const rest = new REST({ version: "10" }).setToken(token);
  const commands = await collectCommands();

  if (scope === "global") {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log(`✅ Comandos globales registrados (${commands.length}).`);
  } else {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log(`✅ Comandos de servidor registrados (${commands.length}) en ${guildId}.`);
  }
}

main().catch((err) => {
  console.error("❌ Error registrando comandos:", err);
  process.exit(1);
});
