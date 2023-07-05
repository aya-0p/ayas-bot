import { CommandInteraction, GuildMember } from "discord.js";
import axios from "axios";
import { APIEmbed } from "discord.js";
import { env } from "../../../env";

/**
 * ## デバッグ用ログ
 * - debugに送信されます
 * - 重要でないもののみ
 */
export const debug = async (data: string): Promise<void> => {
  await sendLog({
    id: "debug",
    body: data,
    color: 11184810,
  });
  return;
};

/**
 * ## 一般情報用ログ
 * - infoに送信されます
 * - 基本はここへ
 */
export const info = async (data: string): Promise<void> => {
  await sendLog({
    id: "info",
    body: data,
  });
};

/**
 * ## 警告用ログ
 * - warningに送信されます
 * - 今後のBotの実行に問題はないが明らかに問題があるもの
 */
export const warning = async (data: string): Promise<void> => {
  await sendLog({
    id: "warning",
    body: data,
    color: 16776960,
  });
};

/**
 * ## エラー用ログ
 * - errorに送信されます
 * - 今後の実行にも問題があるもの
 */
export const error = async (data: unknown): Promise<void> => {
  let eData: string = "";
  if (data instanceof Error) {
    eData = data.stack ?? data.message;
  } else if (typeof data === "string") {
    eData = data;
  } else if (typeof data === "bigint" || typeof data === "number") {
    eData = data.toString();
  } else {
    eData = "不明なエラーです。詳しくはコンソールを参照。";
  }
  console.error(data);
  await sendLog({
    id: "error",
    body: eData,
    color: 16711680,
  });
};

const controlServer = axios.create({
  baseURL: `http://localhost:${env.project.ports.control}`,
  proxy: false,
  headers: { "Content-Type": "application/json" },
});

const sendLog = (data: sendLogData) =>
  new Promise<void>((resolve) => {
    if (!env.project.test)
      controlServer
        .post("/log", data)
        .then(() => {
          resolve();
        })
        .catch(() => {
          console.error("could not send log");
          console.log(data);
          resolve();
        });
  });
interface sendLogData {
  id: string;
  title?: string;
  body?: string;
  footer?: string;
  date?: string;
  author?: { name: string; icon_url: string; url?: string };
  embed?: APIEmbed;
  color?: number;
  image?: { url: string; proxy: string };
  video?: { url: string; proxy: string };
  url?: string;
}
