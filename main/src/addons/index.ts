import { addonEvents } from "./events";
import client from "../server";
import { audio, server, serverNotice } from "./scripts/log";
import { ChatInputGuildCommandInteraction } from "../scripts/utility";
import {
  Channel,
  ChatInputCommandInteraction,
  Collection,
  Guild,
  GuildAuditLogsEntry,
  GuildBasedChannel,
  GuildMember,
  Message,
  User,
} from "discord.js";
import { VCs } from "../scripts/connection";
import voiceRecorder from "./scripts/voiceRecorder";
import { recodeAll } from "./scripts/getDatas";
import { commandDataDev } from "./setupCommands";
import { env } from "../../../env";
client.on("ready", async (client) => {
  addonEvents(client);
  await import("./scripts/status").catch(console.error);
  await import("./scripts/misskey.io").catch(console.error);
});
export default {
  commands: {
    disconnect: {
      success: (interaction: ChatInputGuildCommandInteraction) =>
        server(
          interaction.guild,
          ":x: Bot Disconnected from the Voice Channel",
          interaction.channel.name,
          interaction.member
        ),
      error: (interaction: ChatInputGuildCommandInteraction) =>
        server(
          interaction.guild,
          "Bot did not Disconnect from the Voice Channel",
          interaction.channel.name,
          interaction.member
        ),
    },
    join: {
      connectionNotFound: (interaction: ChatInputGuildCommandInteraction) =>
        server(
          interaction.guild,
          "VoiceConnection not found",
          interaction.channel.name,
          interaction.member
        ),
      unJoinalbe: (interaction: ChatInputGuildCommandInteraction) =>
        server(
          interaction.guild,
          "No permission to join",
          interaction.member.voice.channel?.name,
          interaction.member
        ),
      stageChannel: (interaction: ChatInputGuildCommandInteraction) =>
        server(
          interaction.guild,
          "This is StageChannel",
          interaction.member.voice.channel?.name,
          interaction.member
        ),
      unSpeakable: (interaction: ChatInputGuildCommandInteraction) =>
        server(
          interaction.guild,
          "No permission to speak(unspeakable)",
          interaction.member.voice.channel?.name,
          interaction.member
        ),
      success: (interaction: ChatInputGuildCommandInteraction) =>
        server(
          interaction.guild,
          ":white_check_mark: Bot Connected to the Voice Channel",
          interaction.member.voice.channel?.name,
          interaction.member
        ),
    },
    read: {
      add: (
        interaction: ChatInputGuildCommandInteraction,
        before: string,
        after: string
      ) =>
        serverNotice(
          interaction.guild.id,
          "Replace Added (Text)",
          interaction.channel.name,
          `By: ${interaction.member.displayName}\n${before} => ${after}`
        ),
      remove: {
        text: (
          interaction: ChatInputGuildCommandInteraction,
          before: string,
          after: string
        ) =>
          serverNotice(
            interaction.guild.id,
            "Replace Deleted (Text)",
            interaction.channel.name,
            `By: ${interaction.member.displayName}\n${before} => ${after}`
          ),
        regex: (
          interaction: ChatInputGuildCommandInteraction,
          before: string,
          after: string
        ) =>
          serverNotice(
            interaction.guild.id,
            "Replace Deleted (Regex)",
            interaction.channel.name,
            `By: ${interaction.member.displayName}\n${before} => ${after}`
          ),
      },
      show: (interaction: ChatInputGuildCommandInteraction) =>
        server(
          interaction.guild,
          "Showed Replaces",
          interaction.channel.name,
          interaction.member
        ),
    },
    reply: {
      add: (
        interaction: ChatInputGuildCommandInteraction,
        search: string,
        returnMsg: string
      ) =>
        serverNotice(
          interaction.guild.id,
          "Reply Added",
          interaction.channel.name,
          `By: ${interaction.member.displayName}\n${search} => ${returnMsg}`
        ),
      remove: (
        interaction: ChatInputGuildCommandInteraction,
        search: string,
        returnMsg: string
      ) =>
        serverNotice(
          interaction.guild.id,
          "Reply Deleted",
          interaction.channel.name,
          `By: ${interaction.member.displayName}\n${search} => ${returnMsg}`
        ),
      show: (interaction: ChatInputGuildCommandInteraction) =>
        server(
          interaction.guild,
          "Showed Replys",
          interaction.channel.name,
          interaction.member
        ),
    },
    report: (interaction: ChatInputCommandInteraction) =>
      server(
        interaction.guild as Guild,
        "New Report",
        (interaction.channel as any)?.name ?? "DM"
      ),
    settings: {
      autoJoin: (interaction: ChatInputGuildCommandInteraction, to: boolean) =>
        serverNotice(
          interaction.guild.id,
          "Settings Changed",
          undefined,
          `AutoJoin: ${to}`
        ),
      vcNotice: {
        enable: (
          interaction: ChatInputGuildCommandInteraction,
          notice: string
        ) =>
          serverNotice(
            interaction.guild.id,
            "Settings Changed",
            undefined,
            `voiceChannelNotice: ${notice}`
          ),
        disable: (interaction: ChatInputGuildCommandInteraction) =>
          serverNotice(
            interaction.guild.id,
            "Settings Changed",
            undefined,
            `voiceChannelNotice: (disable)`
          ),
      },
      clock: {
        enable: (
          interaction: ChatInputGuildCommandInteraction,
          time: number,
          message: string
        ) =>
          serverNotice(
            interaction.guild.id,
            "Settings changed",
            undefined,
            `Changed clock message to ${message} on ${time}`
          ),
        disable: (
          interaction: ChatInputGuildCommandInteraction,
          time: number
        ) =>
          serverNotice(
            interaction.guild.id,
            "Settings changed",
            undefined,
            `Clock message deleted on ${time}`
          ),
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
    ) =>
      server(
        interaction.guild,
        `Changed Voice to ${interactionData.id}(${voiceName})`,
        interaction.channel.name,
        interaction.member,
        `id: ${interactionData.id}\nspeed: ${interactionData.speed}\npitch: ${interactionData.pitch}\nintonation: ${interactionData.intonation}\nvolume: ${interactionData.volume}`
      ),
  },
  checkVoiceConnections: {
    disconnect: {
      user: (
        guildId: string,
        audit: GuildAuditLogsEntry,
        time: number,
        reason: string
      ) =>
        serverNotice(
          guildId,
          "Bot Disconnected from the Voice Channel",
          reason,
          `User: ${audit.executor?.username}(${audit.executor?.id})\nTime: ${time}ms before`
        ),
      noLog: (guildId: string, reason: string) =>
        serverNotice(
          guildId,
          "Bot Disconnected? from the Voice Channel",
          reason,
          `No Audit Log`
        ),
      force: (guildId: string, reason: string) =>
        serverNotice(
          guildId,
          ":x: Connection Destroyed Forcibly",
          undefined,
          `Reason: ${reason}`
        ),
    },
    reJoin: (guildId: string) => serverNotice(guildId, "Rejoin..."),
  },
  connections: {
    playing: (text: string, guildId: string) =>
      audio(`Playing ${text}`, guildId),
  },
};
export const onVoiceConnectionEstablished = (voiceConnection: VCs) => {
  voiceConnection.speakingChannel.members.forEach((member) => {
    voiceRecorder(member.voice);
  });
};

const recodeOn = {
  guildFn: async (guild: Guild) => {
    datas.guilds.set(guild.id, guild);
  },
  channelFn: async (channel: GuildBasedChannel) => {
    datas.anyChannels.set(channel.id, channel);
    datas.guildChannels.set(channel.id, channel);
  },
  memberFn: async (member: GuildMember) => {
    datas.users.set(member.user.id, member.user);
  },
  messageFn: async (message: Message<boolean>) => {
    datas.anyMessages.set(message.id, message);
    if (message.inGuild()) datas.guildMessages.set(message.id, message);
  },
};

export const initialize = async () => {
  await recodeAll(recodeOn).catch(() => {});
  await client.application?.commands
    .set(commandDataDev, env.main.bot.testGuildId)
    .catch(() => {});
};

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
