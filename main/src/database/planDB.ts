import { getDateBefore, Plan } from "../commands/plan.js";
import sqlite from "sqlite3";
import moment from "moment";
import client from "../server.js";
import { getTextBasedChannel } from "../scripts/utility.js";
import { Collection } from "discord.js";
import { env } from "../../../env/index.js";
const databasePath = env.main.database.plan;
const db = new sqlite.Database(databasePath);
export const setPlan = (plan: Plan): Promise<void> =>
  new Promise((resolve, reject) => {
    db.run(
      "insert into plan values(?, ?, ?, ?, ?, ?)",
      [
        plan.guild.id,
        plan.date.toISOString(),
        plan.notificationTime,
        plan.notificationChannel.id,
        plan.name,
        plan.description ?? null,
      ],
      function (err) {
        if (err) return reject(err);
        return resolve();
      }
    );
  });
export const getPlans = (plans: Collection<string, Plan>): Promise<void> =>
  new Promise((resolve, reject) => {
    db.all(
      "select * from plan",
      [],
      function (err, rows: Array<DBPlanRaw> | null) {
        if (err) return reject(err);
        if (!rows) return resolve();
        rows.forEach((plan) => {
          const guild = client.guilds.cache.get(plan.guild),
            channel = getTextBasedChannel(plan.notificationch);
          if (guild && channel)
            plans.set(`${plan.guild}_${plan.name}`, {
              guild: guild,
              date: moment(plan.date),
              notificationTime: plan.notificationtime ?? undefined,
              notificationDate: getDateBefore(
                moment(plan.date),
                plan.notificationtime ?? undefined
              ),
              notificationChannel: channel,
              name: plan.name,
              description: plan.description ?? undefined,
            });
        });
        resolve();
      }
    );
  });
export const deletePlan = (guild: string, name: string): Promise<void> =>
  new Promise((resolve, reject) => {
    db.run(
      "delete from plan where guild = ? and name = ?",
      [guild, name],
      function () {
        resolve();
      }
    );
  });
interface DBPlanRaw {
  guild: string;
  date: string;
  notificationtime?: "1m" | "5m" | "1h" | "2h" | "1d" | "1w" | "1M" | "1y";
  notificationDate?: string;
  notificationch: string;
  name: string;
  description?: string;
}
