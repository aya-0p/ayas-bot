import { Client, Options, GatewayIntentBits } from "discord.js";
import * as log from "./scripts/log.js";
import { env } from "../../env/index.js";

export const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  makeCache: Options.cacheEverything(),
});

import init from "./initialization/index.js";
client.on("ready", init);

process.on("unhandledRejection", (reason) => log.error(reason));

console.log("SCRIPT STARTED");
client.login(env.main.discordToken); //ログイン
