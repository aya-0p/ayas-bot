import {
  APIEmbed,
  ApplicationCommandOptionType,
  ChannelType,
  Client,
  GatewayIntentBits,
  Interaction,
  InteractionType,
  MessageCreateOptions,
} from "discord.js";
import express from "express";
import bodyParser from "body-parser";
import moment from "moment";
import schedule from "node-schedule";
import axios from "axios";
import { env } from "../../env/index.js";
const receivedFromGuild = new Map<string | undefined, string>();
env.log.channels.forEach((datas) =>
  receivedFromGuild.set(datas.receiveId, datas.sendChannelId)
);
const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});
const app = express();
client.login(env.log.discordToken);
const controlServer = axios.create({
  baseURL: `http://localhost:${env.project.ports.control}`,
  proxy: false,
});
controlServer.get("/start/log").catch((e) => {
  console.log("controlServer did not open");
});
app.listen(env.project.ports.log, function () {
  console.log("Server Started");
});
app.use(bodyParser.json());
app.get("/", (req_, res) => {
  res.send("ok");
});
app.post("/log", (req, res) => {
  res.send("ok");
  const requestBody: MessageCreateOptions & { id: string } = req.body;
  const sendChannelId: string =
    receivedFromGuild.get(requestBody.id) ?? env.log.defaultChannel;
  const channel = client.channels.cache.get(sendChannelId);
  if (channel?.type !== ChannelType.GuildText) {
    console.error("Send Text Channel Not Found.");
    return;
  }
  const sendData: MessageCreateOptions & { id?: string } = requestBody;
  delete sendData.id
  channel.send(sendData).catch((e) => {
    console.error(e);
    console.error(requestBody);
  });
});
app.post("/mention", (req, res) => {
  const channel = client.channels.cache.get(env.log.mentionChannel);
  if (channel?.type !== ChannelType.GuildText) return;
  channel.send(`<@${env.project.ownerUserId}>`);
  res.send("ok");
});
app.post("/web", (req, res) => {
  const channel = client.channels.cache.get(env.log.webChannel);
  if (channel?.type !== ChannelType.GuildText) return;
  channel.send(req.body.body ?? "不明");
  res.send("ok");
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.type !== InteractionType.ApplicationCommand) return;
  const InteractionData = { subcommand: "" };
  interaction.options.data.forEach((data) => {
    if (data.type === ApplicationCommandOptionType.Subcommand)
      InteractionData.subcommand = data.name;
  });
  const serverName = InteractionData.subcommand;
  interaction.reply({ content: "running", ephemeral: true });
  switch (interaction.commandName) {
    case "stop":
      controlServer.get(`/stop/${serverName}`).catch(() => {
        console.log("controlServer did not open");
      });
      break;
    default:
      break;
  }
});
client.on("ready", () => {
  client.application?.commands.set([
    {
      name: "stop",
      description: "stop server",
      options: [
        {
          name: "main",
          description: "main server",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "test",
          description: "test server",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
  ]);
});
let t: number = 0;
schedule.scheduleJob("* * * * * *", () => {
  controlServer
    .get("/", { timeout: 500 })
    .then(() => {
      t = 0;
    })
    .catch(() => {
      t++;
      if (t === 5) {
        process.exit();
      }
    });
});
