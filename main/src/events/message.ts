import client from "../server.js";
import * as log from "../scripts/log.js";
import getReply from "../scripts/reply.js";
import { read } from "../scripts/readMessage.js";
import { Message } from "discord.js";
import { env } from "../../../env/index.js";
import { ExString } from "../scripts/utility.js";
import axios from "axios";

const serverReplys1: Array<string> = [
  "(;//́Д/̀/)ﾊｧﾊｧ",
  "(*´´ิД´ิ`)ﾊｧﾊｧ♡",
  "(;//́Д/̀/)'`ｧ'`ｧ",
  "(:.;ﾟ;Д;ﾟ;.:)ﾊｧﾊｧ",
  "'`ァ,、ァ(*´Д｀*)'`ァ,、ァ",
  "'`ｧ'`ｧԅ(//́Д/̀/ԅ)'`ｧ,､ｧ♡",
  "(*ᵒ̴̶̷Дᵒ̴̶̷)ﾊｧﾊｧ",
  "(*´д｀*)ﾊｧﾊｧ",
  "(;¤̴̶̷д¤̴̶̷)ﾊｧﾊｧ♡",
  "(･:ﾟдﾟ:･)ﾊｧﾊｧ",
  "ﾊｧﾊｧ(*´Д`*)ﾊｧﾊｧ",
  "(*´Д`)ﾊｧﾊｧ",
  "(；´Д`）ﾊｱﾊｱ",
  "⁽⁽꜂(꜀(⑉ˎДˏ⑉)꜆₎₎'`ｧ'`ｧ",
];

const translate = (text: string): Promise<string> =>
  new Promise((resolve) => {
    try {
      //"!", "?", ";"から始まる文章を無視
      if (text.match(/^[!\?;][\s\S]*/)) return resolve("");
      const newText = new ExString(text);
      //URLは無視
      newText.replace(/https?:\/\/[\w!\?/\+\-_~=;\.,\*&@#\$%\(\)'\[\]]+/g, "");
      //"\"は無視
      newText.replace(/\\/g, "");
      //```(str)```内部は無視
      newText.replace(/```[\s\S]+```/g, "");
      //||(str)||内部は無視
      newText.replace(/\|\|[\s\S]+\|\|/g, "");
      //`(str)`内部は無視
      newText.replace(/`[\s\S]+`/g, "");
      //アルファベット、数字、空白など以外は無視
      newText.replace(/[^a-zA-Z0-9\s\.,'"!\?]+/gu, " ");
      //空白の連続は半角スペース1つに
      newText.replace(/\s+/g, " ");
      if (
        newText
          .toString()
          .split(" ")
          .filter(
            (e) => !(e.length < 3 || e.match(/^[wWｗＷ\s0-9０-９\.,']+$/))
          ).length < 4
      )
        return resolve("");
      if (!env.project.test)
        axios
          .post(env.main.bot.googleTranslateUrl, {
            text: newText.toString(),
            source: "",
            target: "ja",
          })
          .then((value) => {
            const translatedText: string = value.data.text;
            if (
              newText
                .toString()
                .replace(/[^a-zA-Z0-9\s\.,!\?'"]+/gu, " ")
                .replace(/\s/g, "") ===
              translatedText
                .replace(/[^a-zA-Z0-9\s\.,!\?'"]+/gu, " ")
                .replace(/\s/g, "")
            ) {
              return resolve("");
            } else {
              return resolve(translatedText);
            }
          })
          .catch(() => {
            log.error("translate: cannot send google server");
          });
      else resolve("");
    } catch {
      return resolve("");
    }
  });

const getMessageFromUrl = (message: Message): Promise<Array<Message<true>>> =>
  new Promise(async (resolve, reject) => {
    const discordUrls = message.content
      .replace(/\|\|[\s\S]*?\|\|/g, " ")
      .match(/https:\/\/discord.com\/channels\/\d+\/\d+\/\d+/g);
    if (discordUrls === null) return resolve([]);
    const messages: Array<Message<true>> = [];
    for (const discordUrl of discordUrls) {
      const t: Array<string> = discordUrl.split("/");
      const guildId = t[4];
      const channelId = t[5];
      const messageId = t[6];
      if (!guildId && !channelId && !messageId) continue;
      if (message.inGuild()) {
        if (message.guildId !== guildId) continue;
        const chanenl = message.guild.channels.cache.get(channelId);
        if (!chanenl || !chanenl.isTextBased()) continue;
        const fetchedMessage = await chanenl.messages
          .fetch(messageId)
          .catch(() => {});
        if (!fetchedMessage) continue;
        messages.push(fetchedMessage);
      }
    }
    resolve(messages);
  });

client.on("messageCreate", async (message: Message | void) => {
  message = await message?.fetch(true).catch(() => {});
  if (
    !message ||
    message.flags.has("Ephemeral") ||
    !message.inGuild() ||
    message.guild?.id === env.main.bot.testGuildId ||
    message.author.bot ||
    message.author.system
  )
    return;
  read(message);
  autoReply(message);
  const text = await translate(message.content).catch(() => {});
  if (!text || text === "") return;
  message
    .reply({
      embeds: [
        {
          description: text,
          footer: {
            text: "翻訳された文章",
          },
        },
      ],
      allowedMentions: {
        repliedUser: false,
      },
    })
    .then((message) => message.react("✖").catch(() => {}));
});

const autoReply = (message: Message): void => {
  let replyMessage: string = "";
  let replyMatch: boolean = false;
  const guild = message.guild;
  if (guild === null) return;
  getReply(guild.id).forEach((obj) => {
    if (message.content.match(obj.search)) {
      replyMessage = obj.returnmsg;
      replyMatch = true;
    }
  });
  let serverReplyMatch1 = false;
  serverReplys1.forEach((e) => {
    if (message.content.indexOf(e) !== -1) {
      serverReplyMatch1 = true;
      replyMatch = true;
    }
  });
  if (serverReplyMatch1) replyMessage = "(;//́Д/̀/)ﾊｧﾊｧ";
  if (replyMatch) {
    message.channel.send({ content: replyMessage }).then((message) => {
      message.react("✖");
      read(message);
    });
    log.info(`Automatically replyed,\n${replyMessage}`);
  }
  getMessageFromUrl(message).then((messages) => {
    messages.forEach(async (msg) => {
      const embed = {
        description: msg.content,
        color: 5637116,
        timestamp: msg.createdAt.toISOString(),
        author: {
          name:
            message.member?.displayName ?? message.author.username ?? "不明",
          url: message.url,
          icon_url:
            message.member?.displayAvatarURL() ??
            message.author.displayAvatarURL(),
        },
        footer: {
          text: "✖を押してメッセージを削除",
        },
      };
      message.channel
        .send({ content: msg.channel.name, embeds: [embed] })
        .then((message) => message.react("✖").catch(() => {}));
    });
  });
};
