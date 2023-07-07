import schedule from "node-schedule";
import getSettings from "./settings.js";
import { client } from "../server.js";
import { read } from "./readMessage.js";
import { getTextBasedChannel } from "./utility.js";

const clock = (
  time:
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
): void => {
  client.guilds.cache.forEach((guild) => {
    const settings = getSettings(guild.id);
    const message = settings.clock[time];
    if (message === "") return;
    const channel = getTextBasedChannel(settings.clock.channel);
    if (channel) {
      channel
        .send(message)
        .then((message) => {
          message.react("✖");
          read(message);
        })
        .catch(() => {});
    }
  });
};
schedule.scheduleJob("0 0 0 * * *", () => clock(0));
schedule.scheduleJob("0 0 1 * * *", () => clock(1));
schedule.scheduleJob("0 0 2 * * *", () => clock(2));
schedule.scheduleJob("0 0 3 * * *", () => clock(3));
schedule.scheduleJob("0 0 4 * * *", () => clock(4));
schedule.scheduleJob("0 0 5 * * *", () => clock(5));
schedule.scheduleJob("0 0 6 * * *", () => clock(6));
schedule.scheduleJob("0 0 7 * * *", () => clock(7));
schedule.scheduleJob("0 0 8 * * *", () => clock(8));
schedule.scheduleJob("0 0 9 * * *", () => clock(9));
schedule.scheduleJob("0 0 10 * * *", () => clock(10));
schedule.scheduleJob("0 0 11 * * *", () => clock(11));
schedule.scheduleJob("0 0 12 * * *", () => clock(12));
schedule.scheduleJob("0 0 13 * * *", () => clock(13));
schedule.scheduleJob("0 0 14 * * *", () => clock(14));
schedule.scheduleJob("0 0 15 * * *", () => clock(15));
schedule.scheduleJob("0 0 16 * * *", () => clock(16));
schedule.scheduleJob("0 0 17 * * *", () => clock(17));
schedule.scheduleJob("0 0 18 * * *", () => clock(18));
schedule.scheduleJob("0 0 19 * * *", () => clock(19));
schedule.scheduleJob("0 0 20 * * *", () => clock(20));
schedule.scheduleJob("0 0 21 * * *", () => clock(21));
schedule.scheduleJob("0 0 22 * * *", () => clock(22));
schedule.scheduleJob("0 0 23 * * *", () => clock(23));
