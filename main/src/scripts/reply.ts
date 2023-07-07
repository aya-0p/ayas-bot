import { Snowflake } from "discord.js";
import fs from "fs-extra";
import schedule from "node-schedule";
import path from "node:path";
import { env } from "../../../env/index.js";

const reply_o: Array<ObjectReply> = fs.readJSONSync(
  path.join(env.project.rootDirPath, "main/other/replys.json")
);
const reply: Map<Snowflake, Array<Reply>> = new Map();
reply_o.forEach((rep) => {
  reply.set(rep.guildId, rep.replys);
});
interface ObjectReply {
  guildId: string;
  replys: Array<Reply>;
}
interface Reply {
  search: string;
  returnmsg: string;
}

export default (guildId: Snowflake): Array<Reply> => {
  const arr = reply.get(guildId);
  if (arr) return arr;
  const arr2: Array<Reply> = [];
  reply.set(guildId, arr2);
  return arr2;
};
let t: Array<ObjectReply> = [];
schedule.scheduleJob("* * * * * *", () => {
  let u: Array<ObjectReply> = [];
  reply.forEach((v, k) => {
    u.push({ guildId: k, replys: v });
  });
  if (JSON.stringify(t) !== JSON.stringify(u)) {
    t = u;
    fs.writeJSONSync(
      path.join(env.project.rootDirPath, "main/other/replys.json"),
      t
    );
  }
});
