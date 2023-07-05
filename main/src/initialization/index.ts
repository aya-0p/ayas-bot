import { ActivityType, Client, VoiceChannel } from "discord.js";
import {
  NoSubscriberBehavior,
  createAudioPlayer,
  joinVoiceChannel,
} from "@discordjs/voice";
import { voiceConnectionMap } from "../scripts/connection";
import settings from "../scripts/settings";
import * as log from "../scripts/log";
import { env } from "../../../env";
import { commandData } from "../setupCommands";
import schedule from "node-schedule";
import httpServer from "./httpServer";
import checkAutoDelete from "./checkAutoDelete";
import { initialize } from "../addons";
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
  await import("../scripts/checkConnections").catch(console.error);
  await import("../events/interaction").catch(console.error);
  await import("../events/message").catch(console.error);
  await import("../scripts/clock").catch(console.error);
  await import("../scripts/connection").catch(console.error);
  await import("../database/statusDB").catch(console.error);
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
  await initialize();
  checkAutoDelete(client);
};
