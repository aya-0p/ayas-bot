import client from "../server";
import { ChatInputGuildCommandInteraction } from "../scripts/utility";
import {
  Channel,
  ChatInputCommandInteraction,
  Collection,
  Guild,
  GuildAuditLogsEntry,
  GuildBasedChannel,
  Message,
  User,
} from "discord.js";
import { VCs } from "../scripts/connection";
client.on("ready", async (client) => {});
export default {
  commands: {
    disconnect: {
      success: (interaction: ChatInputGuildCommandInteraction) => {},
      error: (interaction: ChatInputGuildCommandInteraction) => {},
    },
    join: {
      connectionNotFound: (interaction: ChatInputGuildCommandInteraction) => {},
      unJoinalbe: (interaction: ChatInputGuildCommandInteraction) => {},
      stageChannel: (interaction: ChatInputGuildCommandInteraction) => {},
      unSpeakable: (interaction: ChatInputGuildCommandInteraction) => {},
      success: (interaction: ChatInputGuildCommandInteraction) => {},
    },
    read: {
      add: (
        interaction: ChatInputGuildCommandInteraction,
        before: string,
        after: string
      ) => {},
      remove: {
        text: (
          interaction: ChatInputGuildCommandInteraction,
          before: string,
          after: string
        ) => {},
        regex: (
          interaction: ChatInputGuildCommandInteraction,
          before: string,
          after: string
        ) => {},
      },
      show: (interaction: ChatInputGuildCommandInteraction) => {},
    },
    reply: {
      add: (
        interaction: ChatInputGuildCommandInteraction,
        search: string,
        returnMsg: string
      ) => {},
      remove: (
        interaction: ChatInputGuildCommandInteraction,
        search: string,
        returnMsg: string
      ) => {},
      show: (interaction: ChatInputGuildCommandInteraction) => {},
    },
    report: (interaction: ChatInputCommandInteraction) => {},
    settings: {
      autoJoin: (
        interaction: ChatInputGuildCommandInteraction,
        to: boolean
      ) => {},
      vcNotice: {
        enable: (
          interaction: ChatInputGuildCommandInteraction,
          notice: string
        ) => {},
        disable: (interaction: ChatInputGuildCommandInteraction) => {},
      },
      clock: {
        enable: (
          interaction: ChatInputGuildCommandInteraction,
          time: number,
          message: string
        ) => {},
        disable: (
          interaction: ChatInputGuildCommandInteraction,
          time: number
        ) => {},
      },
    },
    voice: (
      interaction: ChatInputGuildCommandInteraction,
      interactionData: {
        id: number;
        speed: number;
        pitch: number;
        intonation: number;
        volume: number;
      },
      voiceName: string
    ) => {},
  },
  checkVoiceConnections: {
    disconnect: {
      user: (
        guildId: string,
        audit: GuildAuditLogsEntry,
        time: number,
        reason: string
      ) => {},
      noLog: (guildId: string, reason: string) => {},
      force: (guildId: string, reason: string) => {},
    },
    reJoin: (guildId: string) => {},
  },
  connections: {
    playing: (text: string, guildId: string) => {},
  },
};
export const onVoiceConnectionEstablished = (voiceConnection: VCs) => {};

export const initialize = async () => {};

export const datas: Datas = {
  guilds: new Collection(),
  guildChannels: new Collection(),
  anyChannels: new Collection(),
  users: new Collection(),
  guildMessages: new Collection(),
  anyMessages: new Collection(),
};
export interface Datas {
  guilds: Collection<string, Guild>;
  guildChannels: Collection<string, GuildBasedChannel>;
  anyChannels: Collection<string, Channel>;
  users: Collection<string, User>;
  guildMessages: Collection<string, Message<true>>;
  anyMessages: Collection<string, Message<boolean>>;
}
