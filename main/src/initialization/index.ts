import { ActivityType, Client, VoiceChannel } from "discord.js";
import {
  NoSubscriberBehavior,
  createAudioPlayer,
  joinVoiceChannel,
} from "@discordjs/voice";
import { voiceConnectionMap } from "../scripts/connection.js";
import settings from "../scripts/settings.js";
import * as log from "../scripts/log.js";
import { env } from "../../../env/index.js";
import { commandData } from "../setupCommands.js";
import schedule from "node-schedule";
import httpServer from "./httpServer.js";
import checkAutoDelete from "./checkAutoDelete.js";
import { initialize } from "../addons/index.js";
export default async (client: Client<true>) => {
  //初期処理
  log.info(
    `Bot Version ${env.project.version}\nLogged in as ${
      client.user.tag ?? "(undefined)"
    }`
  );
  if (!env.project.test) httpServer();
  //コマンドをセット
  await client.application.commands.set(commandData).catch(() => {});
  log.info("Ready");
  schedule.scheduleJob("*/5 * * * * *", () => {
    if (client.ws.status === 0) {
      client.user?.setActivity(`Version ${env.project.version}`, {
        type: ActivityType.Playing,
      });
    }
  });
  await import("../scripts/checkConnections.js").catch(console.error);
  await import("../events/interaction.js").catch(console.error);
  await import("../events/message.js").catch(console.error);
  await import("../scripts/clock.js").catch(console.error);
  await import("../scripts/connection.js").catch(console.error);
  await import("../database/statusDB.js").catch(console.error);
  client.guilds.cache.forEach((guild) => {
    if (guild.members.me?.voice.channel instanceof VoiceChannel) {
      const voiceChannel = guild.members.me.voice.channel;
      const anyChannel = client.channels.cache.get(settings(guild.id).readch);
      if (anyChannel?.isTextBased() && settings(guild.id).autojoin) {
        voiceConnectionMap.set(guild.id, {
          guild: guild,
          readingChannel: anyChannel,
          speakingChannel: voiceChannel,
          connection: joinVoiceChannel({
            guildId: guild.id,
            channelId: voiceChannel.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfMute: false,
            selfDeaf: false,
          }),
          audioPlayer: createAudioPlayer({
            behaviors: {
              noSubscriber: NoSubscriberBehavior.Pause,
              maxMissedFrames: Number.MAX_SAFE_INTEGER,
            },
          }),
          speakingDatas: [],
          speaking: false,
          recordingList: [],
          connectionErrors: 0,
        });
      }
    }
  });
  await initialize(client);
  checkAutoDelete(client);
};
