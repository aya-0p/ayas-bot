import { Snowflake } from "discord.js";
import { readJSONSync, writeJSONSync } from "fs-extra";
import client from "../server.js";
import { voiceConnectionMap } from "../scripts/connection.js";
import schedule from "node-schedule";
import moment from "moment";
import { join } from "../commands/join.js";
import {
  getVoiceChannel,
  getTextBasedChannel,
  runErrorableFunction,
} from "../scripts/utility.js";
import { env } from "../../../env/index.js";
const databasePath = env.main.database.status;
const database = runErrorableFunction<ServerStatus>(
  () => readJSONSync(databasePath),
  {
    voiceStatus: {},
  }
);

for (const vc in database.voiceStatus) {
  const VC = database.voiceStatus[vc];
  if (!VC || moment(VC.time).add(1, "hour").isBefore()) continue;
  const voiceChannel = getVoiceChannel(VC.voiceChannel);
  const textChannel = getTextBasedChannel(VC.textChannel);
  const guild = client.guilds.cache.get(vc);
  if (voiceChannel && textChannel && guild)
    setTimeout(() => join(guild, textChannel, voiceChannel), 10000);
}
setTimeout(() => {
  schedule.scheduleJob("*/5 * * * * *", (time) => {
    database.voiceStatus = {};
    for (const [serverId, VC] of voiceConnectionMap)
      database.voiceStatus[serverId] = {
        voiceChannel: VC.speakingChannel.id,
        textChannel: VC.readingChannel.id,
        time: time.toISOString(),
      };
    writeJSONSync(databasePath, database);
  });
}, 60000);
interface ServerStatus {
  voiceStatus: {
    [server: string]: VoiceStatus;
  };
}
interface VoiceStatus {
  voiceChannel: Snowflake;
  textChannel: Snowflake;
  time: string;
}
