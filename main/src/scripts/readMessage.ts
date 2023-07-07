import { voiceConnectionMap, speak } from "./connection.js";
import { ExString } from "./utility.js";
import getSettings from "./settings.js";
import * as fs from "fs-extra";
import { Message } from "discord.js";
import { getVoice } from "../database/voiceDB.js";
import { tts } from "../audio/tts.js";
import { Duplex } from "stream";
import ffmpeg from "fluent-ffmpeg";
import path from "node:path";
import { env } from "../../../env/index.js";

const defaultDictionary: Dictionary = fs.readJSONSync(
  path.join(env.project.rootDirPath, "main/other/defaultdic.json")
);
export const readList: Array<Message> = [];
let isRead_Running: boolean = false;
export const read = (message: Message) => {
  readList.push(message);
  if (!isRead_Running) read_();
};
const read_ = async (): Promise<any> => {
  isRead_Running = true;
  const message = readList.shift();
  if (!message) return (isRead_Running = false); //readListにメッセージがなければ終了
  if (!message.inGuild()) return read_(); //メッセージがギルド内のものでなければ次
  const voiceConnection = voiceConnectionMap.get(message.guild.id);
  if (!voiceConnection) return read_(); //ボイスチャンネルに参加していなければ次
  if (
    voiceConnection.readingChannel.id !== message.channel.id &&
    voiceConnection.speakingChannel.id !== message.channel.id
  )
    return read_(); //メッセージが読み上げ対象のチャンネル以外から送信された場合次
  const t_voice = getSettings(message.guild.id).voice.get(message.author.id);
  const voice = t_voice?.voices.get(t_voice.set ?? 0);
  let index = -1;
  const texts = generateText(message); //メッセージを読み上げ文字列に変換
  if (texts.length === 0) return read_();
  for (const text of texts) {
    index++;
    if (text === "") continue;
    const voiceSettings = {
      voiceid: voice?.id ?? 0,
      speed: voice?.speed ?? 1,
      pitch: voice?.pitch ?? 0,
      intonation: voice?.intonation ?? 1,
      volume: voice?.volume ?? 1,
    };
    const generatedVoice = await getVoice(text, voiceSettings);
    const voiceData =
      generatedVoice ??
      (await tts(
        text,
        voiceSettings.voiceid,
        voiceSettings.speed,
        voiceSettings.volume,
        voiceSettings.intonation,
        voiceSettings.pitch
      ));
    const voiceStream = Duplex.from(voiceData);
    const oggOpusStream = ffmpeg()
      .input(voiceStream)
      .audioCodec("libopus")
      .outputFormat("ogg")
      .pipe();
    const vc = voiceConnectionMap.get(message.guildId);
    if (!vc) continue;
    vc.speakingDatas.push({
      data: Duplex.from(oggOpusStream),
      text,
    });
    speak(message.guildId);
  }
  read_();
};

const generateText = (message: Message): Array<string> => {
  try {
    if (message.guild === null) return [];
    const settings = getSettings(message.guild.id);
    if (
      message.content === "" ||
      message.content.match(/^\/\/[\s\S]*/) ||
      message.content.match(/^[!\?;][\s\S]*/) ||
      message.content.match(/^\s*$/)
    )
      return [];
    const Msg = new ExString(
      `${message.member?.displayName ?? message.author.username}さん、${
        message.content
      }`
    ); //読み上げメッセージを設定
    Msg.replace(/https?:\/\/[\w!\?/\+\-_~=;\.,\*&@#\$%\(\)'\[\]]+/g, ""); //URLを読み上げない
    defaultDictionary.text.forEach((e) => {
      Msg.replace(e.before, e.after); //デフォルト辞書のテキスト読み替え
    });
    defaultDictionary.regex.forEach((e) => {
      const rep = new RegExp(e.before, "g");
      Msg.replace(rep, e.after); //デフォルト辞書の正規表現読み替え
    });
    settings.replaces.text.forEach((t) => {
      Msg.replace(t.before, t.after); //Guild設定のテキスト読み替え
    });
    settings.replaces.regex.forEach((r) => {
      const rep = new RegExp(r.before, "g");
      Msg.replace(rep, r.after); //Guild設定の正規表現読み替え
    });
    Msg.replace("\\", ""); //"\"を削除(不具合対策)
    Msg.replace(/\|\|[\s\S]*?\|\|/g, "、"); //隠したメッセージを読まない
    //読み上げ分割できそうな文字で改行する
    Msg.replace(/[？\?]+/g, "？\n");
    Msg.replace(/[！!]+/g, "！\n");
    Msg.replace(/[。\.]+/g, "。\n");
    Msg.replace(/[、,]+/g, "、\n");
    Msg.replace(/[「」\s]+/g, "\n");
    //漢字、ひらがな、カタカナ、アルファベット、数字、"～"以外を読まない
    Msg.replace(
      /[^\p{Script_Extensions=Han}\p{Script_Extensions=Hira}\p{Script_Extensions=Kana}a-zA-Z0-9０-９～ａ-ｚＡ-Ｚ？\?！!。\.、,\n]+/gu,
      "、"
    );
    //「、」の連続をまとめる
    Msg.replace(/、+/, "、");
    //不要な改行を削除
    Msg.replace(/^[\?!？！、。,\.]+$/gm, "");
    Msg.replace(/^$\n/gm, "");
    return Msg.toString().split("\n"); //改行で分割する
  } catch {
    return [];
  }
};

interface Dictionary {
  regex: Dict[];
  text: Dict[];
}

interface Dict {
  before: string;
  after: string;
}
