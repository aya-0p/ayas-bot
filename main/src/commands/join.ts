import {
  createAudioPlayer,
  joinVoiceChannel,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import { ChannelType, Guild, TextBasedChannel, VoiceChannel } from "discord.js";
import { voiceConnectionMap, playNothing } from "../scripts/connection";
import addonLog, { onVoiceConnectionEstablished } from "../addons";
import { ChatInputGuildCommandInteraction } from "../scripts/utility";

export default async (
  interaction: ChatInputGuildCommandInteraction
): Promise<void> => {
  const guild = interaction.guild;
  const member = interaction.member;
  const textChannel = interaction.channel;
  const voiceChannel =
    (() => {
      const ch = interaction.options.getChannel("channel", false);
      if (ch instanceof VoiceChannel) {
        return ch;
      } else {
        return undefined;
      }
    })() ?? member.voice.channel;
  if (voiceChannel === null) {
    await addonLog.commands.join.connectionNotFound(interaction);
    await interaction
      .reply({
        content: "先にボイスチャンネルに接続してください。",
        ephemeral: true,
      })
      .catch(() => {});
    return;
  }
  if (voiceChannel.joinable === false) {
    await addonLog.commands.join.unJoinalbe(interaction);
    await interaction
      .reply({
        content: "ボイスチャンネルに接続する権限がありません。",
        ephemeral: true,
      })
      .catch(() => {});
    return;
  }
  if (voiceChannel.type === ChannelType.GuildStageVoice) {
    await addonLog.commands.join.stageChannel(interaction);
    await interaction
      .reply({
        content: "ステージチャンネルに接続することはできません。",
        ephemeral: true,
      })
      .catch(() => {});
    return;
  }
  if (voiceChannel.speakable === false) {
    await addonLog.commands.join.unSpeakable(interaction);
    await interaction
      .reply({
        content: "発言する権限がありません。",
        ephemeral: true,
      })
      .catch(() => {});
    return;
  }
  await join(guild, textChannel, voiceChannel).catch(console.error);
  await interaction
    .reply({ content: "接続しました。", ephemeral: true })
    .catch(() => {});
  await addonLog.commands.join.success(interaction);
};

export const join = (
  guild: Guild,
  readingChannel: TextBasedChannel,
  speakingChannel: VoiceChannel
): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      const voiceConnection = {
        guild: guild,
        readingChannel: readingChannel,
        speakingChannel: speakingChannel,
        connection: joinVoiceChannel({
          guildId: guild.id,
          channelId: speakingChannel.id,
          adapterCreator: speakingChannel.guild.voiceAdapterCreator,
          selfMute: false,
          selfDeaf: false,
        }),
        audioPlayer: createAudioPlayer({
          behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
            maxMissedFrames: Number.MAX_SAFE_INTEGER,
          },
        }),
        speakingDatas: [],
        speaking: false,
        recordingList: [],
        connectionErrors: 0,
      };
      voiceConnectionMap.set(guild.id, voiceConnection);
      voiceConnection.connection.subscribe(voiceConnection.audioPlayer);
      playNothing(guild.id).catch(() => {});
      onVoiceConnectionEstablished(voiceConnection);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
