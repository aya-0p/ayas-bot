import { Client } from "discord.js";
import settings from "../scripts/settings";
import schedule from "node-schedule";
import moment from "moment";

export default (client: Client<true>) => {
  schedule.scheduleJob("* * * * *", () => {
    client.guilds.cache.forEach((guild) => {
      const settingsMap = new Map(
        settings(guild.id).autoDeleteChannels.map<[string, number]>((del) => [
          del.id,
          del.time,
        ])
      );
      guild.channels.cache.forEach((ch) => {
        if (!ch.isTextBased()) return;
        const time = settingsMap.get(ch.id);
        if (!time) return;
        ch.messages.cache.forEach((mes) => {
          const diff = moment(mes.createdAt).add({ h: time }).diff(moment());
          if (diff < 1000) mes.delete().catch(() => {});
        });
      });
    });
  });
};
