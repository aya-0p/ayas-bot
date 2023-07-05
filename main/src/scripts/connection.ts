import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
  entersState,
  StreamType,
  VoiceConnection,
} from "@discordjs/voice";
import { Guild, Snowflake, TextBasedChannel, VoiceChannel } from "discord.js";
import * as log from "./log";
import addonLog from "../addons";
import { Readable } from "stream";
import path from "path";
import { env } from "../../../env";

export const voiceConnectionMap: Map<Snowflake, VCs> = new Map();

export const speak = (guildId: Snowflake): void => {
  if (voiceConnectionMap.get(guildId)?.speaking === true) return;
  speak_(guildId);
};

const speak_ = (guildId: Snowflake): void => {
  const voiceConnections = voiceConnectionMap.get(guildId);
  if (!voiceConnections) return;
  const speakData = voiceConnections.speakingDatas.at(0);
  if (!speakData) return;
  voiceConnections.speaking = true;
  const resource = createAudioResource(speakData.data, {
    inputType: StreamType.OggOpus,
  });
  voiceConnections.audioPlayer.play(resource);
  addonLog.connections.playing(speakData.text, guildId);
  entersState(voiceConnections.audioPlayer, AudioPlayerStatus.Idle, 15_000)
    .then(() => {
      voiceConnections.speakingDatas.shift();
      voiceConnections.speaking = false;
      speak_(guildId);
    })
    .catch(() => {
      log.warning(`Sound did not finish in 15 seconds`);
      voiceConnections.speakingDatas.shift();
      voiceConnections.speaking = false;
      speak_(guildId);
    });
};

export const playNothing = (guildId: Snowflake): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      const voiceConnections = voiceConnectionMap.get(guildId);
      if (!voiceConnections) throw new Error();
      voiceConnections.audioPlayer.play(
        createAudioResource(
          path.join(env.project.rootDirPath, "main/resources/null.mp3"),
          {
            inputType: StreamType.Arbitrary,
          }
        )
      );
      resolve();
    } catch {
      reject();
    }
  });

export interface VCs {
  audioPlayer: AudioPlayer;
  /** ボイスチャンネルへの接続 */
  connection: VoiceConnection;
  /** 接続のエラー数 */
  connectionErrors: number;
  guild: Guild;
  /** 読み上げるテキストチャンネル */
  readingChannel: TextBasedChannel;
  /** 録音中のメンバーid */
  recordingList: Snowflake[];
  /** 読み上げ中である */
  speaking: boolean;
  /** 参加中(予定)のボイスチャンネル */
  speakingChannel: VoiceChannel;
  /** 音声の生成状況及び再生待ち一覧 */
  speakingDatas: GeneratedVoice[];
}

interface GeneratedVoice {
  data: Readable;
  text: string;
}
