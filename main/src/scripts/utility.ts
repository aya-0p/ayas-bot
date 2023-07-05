import {
  Channel,
  ChannelType,
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  Snowflake,
} from "discord.js";
import client from "../server";

export function str2num(str: string): number {
  const c1Str = str.replace(
    /([一二三四五六七八九]?千)?([一二三四五六七八九]?百)?([一二三四五六七八九]?十)?([一二三四五六七八九]?)?/gm,
    function (_, a: string, b: string, c: string, d: string) {
      if (!a && !b && !c && !d) return "";
      let num = 0;
      num +=
        Number(
          (a ?? "0")
            .replace("九千", "9")
            .replace("八千", "8")
            .replace("七千", "7")
            .replace("六千", "6")
            .replace("五千", "5")
            .replace("四千", "4")
            .replace("三千", "3")
            .replace("二千", "2")
            .replace("千", "1")
        ) * 1000;
      num +=
        Number(
          (b ?? "0")
            .replace("九百", "9")
            .replace("八百", "8")
            .replace("七百", "7")
            .replace("六百", "6")
            .replace("五百", "5")
            .replace("四百", "4")
            .replace("三百", "3")
            .replace("二百", "2")
            .replace("百", "1")
        ) * 100;
      num +=
        Number(
          (c ?? "0")
            .replace("九十", "9")
            .replace("八十", "8")
            .replace("七十", "7")
            .replace("六十", "6")
            .replace("五十", "5")
            .replace("四十", "4")
            .replace("三十", "3")
            .replace("二十", "2")
            .replace("十", "1")
        ) * 10;
      num += Number(
        (d ?? "0")
          .replace("九", "9")
          .replace("八", "8")
          .replace("七", "7")
          .replace("六", "6")
          .replace("五", "5")
          .replace("四", "4")
          .replace("三", "3")
          .replace("二", "2")
          .replace("一", "1")
      );
      return String(num).padStart(4, "0");
    }
  );
  const c2Str = c1Str.replace(/(\d{4})([万億兆])/gm, function (_, a, b) {
    let t = 1;
    switch (b) {
      case "万":
        t = 10 ** 4;
        break;
      case "億":
        t = 10 ** 8;
        break;
      case "兆":
        t = 10 ** 12;
        break;
      default:
        break;
    }
    return String(Number(a) * t) + ",";
  });
  let rNum = 0;
  c2Str.split(",").forEach((n) => (rNum += Number(n)));
  return rNum;
}

export class ExString {
  #string: string = "";
  constructor(inputString: string) {
    this.#string = inputString;
  }
  replace(
    matchRegexp: RegExp | string,
    toChange: string | ((substring: string, ...args: any[]) => string)
  ): string {
    if (typeof toChange === "string")
      this.#string = this.#string.replace(matchRegexp, toChange);
    else this.#string = this.#string.replace(matchRegexp, toChange);
    return this.#string;
  }
  includes(str: string, position?: number) {
    return this.#string.includes(str, position);
  }
  match(regexp: RegExp) {
    return this.#string.match(regexp);
  }
  matchAll(regexp: RegExp) {
    return this.#string.matchAll(regexp);
  }
  toString() {
    return this.#string;
  }
  concat(...str: Array<string>) {
    str.forEach((s) => {
      this.#string += s;
    });
    return this;
  }
  padEnd(targetLength: number, padString?: string) {
    this.#string = this.#string.padEnd(targetLength, padString);
    return this;
  }
  padStart(targetLength: number, padString?: string) {
    this.#string = this.#string.padStart(targetLength, padString);
    return this;
  }
  repeat(count: number) {
    this.#string = this.#string.repeat(count);
    return this;
  }
  search(regexp: RegExp | string) {
    return this.#string.search(regexp);
  }
  slice(beginIndex: number, endIndex?: number) {
    this.#string = this.#string.slice(beginIndex, endIndex);
    return this;
  }
  substring(indexStart: number, indexEnd?: number) {
    this.#string = this.#string.substring(indexStart, indexEnd);
    return this;
  }
  toLocaleLowerCase(locale?: string | Array<string>) {
    this.#string = this.#string.toLocaleLowerCase(locale);
    return this;
  }
  toLocaleUpperCase(locale?: string | Array<string>) {
    this.#string = this.#string.toLocaleUpperCase(locale);
    return this;
  }
  toLowerCase() {
    this.#string = this.#string.toLowerCase();
    return this;
  }
  toUpperCase() {
    this.#string = this.#string.toUpperCase();
    return this;
  }
  trim() {
    this.#string = this.#string.trim();
    return this;
  }
  trimStart() {
    this.#string = this.#string.trimStart();
    return this;
  }
  trimEnd() {
    this.#string = this.#string.trimEnd();
    return this;
  }
  [Symbol.toPrimitive]() {
    return this.#string;
  }
  [Symbol.toStringTag]() {
    return "string, " + this.#string;
  }
  set string(s: string) {
    this.#string = s;
  }
}

export const replaceMention = async (message: Message): Promise<string> => {
  //ユーザー
  const users_: Array<string> = [];
  const users: Map<string, string | undefined> = new Map();
  [...message.content.matchAll(/<@!?(\d+)>/g)].forEach((element) => {
    const id = element[1];
    if (id) users_.push(id);
  });
  for (const userId of users_) {
    const user = client.users.cache.get(userId);
    users.set(userId, user?.username);
  }
  let msg = message.content.replace(
    /<@!?(\d+)>/g,
    (_, p1) => `@${users.get(p1) ?? p1}`
  );
  //ロール
  const roles_: Array<string> = [];
  const roles: Map<string, string | undefined> = new Map();
  [...message.content.matchAll(/<@&(\d+)>/g)].forEach((element) => {
    const id = element[1];
    if (id) roles_.push(id);
  });
  for (const roleId of roles_) {
    if (!message.guild) break;
    const role = await message.guild.roles.fetch(roleId).catch(() => {});
    roles.set(roleId, role?.name);
  }
  msg = msg.replace(/<@&(\d+)>/g, (_, p1) => `@${roles.get(p1) ?? p1}`);
  //チャンネル
  const channels_: Array<string> = [];
  const channels: Map<string, Channel | undefined> = new Map();
  [...message.content.matchAll(/<#(\d+)>/g)].forEach((element) => {
    const id = element[1];
    if (id) channels_.push(id);
  });
  for (const channelId of channels_) {
    const channel = client.channels.cache.get(channelId);
    channels.set(channelId, channel);
  }
  msg = msg.replace(/<#(\d+)>/g, (_, p1) => {
    const channel = channels.get(p1);
    if (!channel) return `#${p1}`;
    if (channel.type === ChannelType.DM || channel.type === ChannelType.GroupDM)
      return `[#${channel.id}](https://discord.com/channels/@me/${channel.id})`;
    return `[#${channel.name}](https://discord.com/channels/${channel.guildId}/${channel.id})`;
  });
  return msg;
};

export const splitString = (str: string): Array<string> => {
  if (str.length > 1000) {
    const a = str.split("\n");
    const result = [];
    let tmp = "";
    a.forEach((e) => {
      if (e.length > 998) {
        if (tmp !== "") result.push(String(tmp));
        result.push("too large string");
        tmp = "";
      } else {
        if ((tmp + "\n" + e).length > 1000) {
          result.push(String(tmp));
          tmp = e;
        } else {
          tmp += "\n" + e;
        }
      }
    });
    if (tmp !== "") result.push(tmp);
    return result;
  } else {
    return [str];
  }
};

export const getTextBasedChannel = (id: Snowflake) => {
  const ch = client.channels.cache.get(id);
  if (ch?.isTextBased() && ch.type !== ChannelType.DM) return ch;
};

export const getVoiceBasedChannel = (id: Snowflake) => {
  const ch = client.channels.cache.get(id);
  if (ch?.isVoiceBased()) return ch;
};

export const getVoiceChannel = (id: Snowflake) => {
  const ch = client.channels.cache.get(id);
  if (ch?.type === ChannelType.GuildVoice) return ch;
};

export const getGuildBasedChannel = (id: Snowflake) => {
  const ch = client.channels.cache.get(id);
  if (ch?.type !== ChannelType.DM && ch?.type !== ChannelType.GroupDM)
    return ch;
};
export const getUnGuildChannel = (id: Snowflake) => {
  const ch = client.channels.cache.get(id);
  if (ch?.type === ChannelType.DM || ch?.type === ChannelType.GroupDM)
    return ch;
};

export const getAnyChannel = (id: Snowflake) => {
  return client.channels.cache.get(id);
};

export const convertDiscordUrl = async (
  anyUrl: string
): Promise<void | Message | Channel | Guild> => {
  const discordGuildMessageUrl = anyUrl.match(
    /https:\/\/discord\.com\/channels\/(?<guild>\d+)\/(?<channel>\d+)\/(?<message>\d+)/
  );
  if (discordGuildMessageUrl) {
    const guildId = discordGuildMessageUrl.groups?.guild;
    const channelId = discordGuildMessageUrl.groups?.channel;
    const messageId = discordGuildMessageUrl.groups?.message;
    if (!guildId || !channelId || !messageId) return;
    const guild = client.guilds.cache.get(guildId);
    const channel = guild?.channels.cache.get(channelId);
    const message = channel?.isTextBased()
      ? channel.messages.cache.get(messageId)
      : undefined;
    if (!guild || !channel || !message) return;
    return message;
  }
  const discordGuildChannelUrl = anyUrl.match(
    /https:\/\/discord\.com\/channels\/(?<guild>\d+)\/(?<channel>\d+)/
  );
  if (discordGuildChannelUrl) {
    const guildId = discordGuildChannelUrl.groups?.guild;
    const channelId = discordGuildChannelUrl.groups?.channel;
    if (!guildId || !channelId) return;
    const guild = client.guilds.cache.get(guildId);
    const channel = guild?.channels.cache.get(channelId);
    if (!guild || !channel) return;
    return channel;
  }
  const discordGuildUrl = anyUrl.match(
    /https:\/\/discord\.com\/channels\/(?<guild>\d+)/
  );
  if (discordGuildUrl) {
    const guildId = discordGuildUrl.groups?.guild;
    if (!guildId) return;
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;
    return guild;
  }
  const discordDMMessageUrl = anyUrl.match(
    /https:\/\/discord\.com\/channels\/@me\/(?<channel>\d+)\/(?<message>\d+)/
  );
  if (discordDMMessageUrl) {
    const channelId = discordDMMessageUrl.groups?.channel;
    const messageId = discordDMMessageUrl.groups?.message;
    if (!channelId || !messageId) return;
    const channel = client.channels.cache.get(channelId);
    const message =
      channel?.type === ChannelType.DM
        ? channel.messages.cache.get(messageId)
        : undefined;
    if (!channel || !message) return;
    return message;
  }
  const discordDMChannelUrl = anyUrl.match(
    /https:\/\/discord\.com\/channels\/@me\/(?<channel>\d+)/
  );
  if (discordDMChannelUrl) {
    const channelId = discordDMChannelUrl.groups?.channel;
    if (!channelId) return;
    const channel = client.channels.cache.get(channelId);
    if (!channel) return;
    return channel;
  }
};

export function runErrorableFunction<T>(
  func: () => T,
  ifErrorValue: T,
  onError?: (err: unknown) => void
): T {
  let returnValue: T | undefined = undefined;
  try {
    returnValue = func();
  } catch (err) {
    onError?.(err);
  }
  return returnValue ?? ifErrorValue;
}

export interface ChatInputGuildCommandInteraction
  extends ChatInputCommandInteraction {
  guild: Guild;
  channel: GuildTextBasedChannel;
  member: GuildMember;
  commandGuildId: Snowflake;
  guildId: Snowflake;
}
