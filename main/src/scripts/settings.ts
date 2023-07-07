import { Snowflake } from "discord.js";
import schedule from "node-schedule";
import { getAllSettingsDB, setSettingsDB } from "../database/settingsDB.js";

const settings: Map<Snowflake, Settings> = new Map();
getAllSettingsDB().then((sets) =>
  sets.forEach((set, id) => settings.set(id, set))
);
schedule.scheduleJob("* * * * * *", () =>
  settings.forEach((setting, id) => setSettingsDB(setting, id))
);

export default (guildId?: Snowflake | null): Settings => {
  const rawSettings: Settings = {
    autojoin: false,
    readch: "",
    voice: new Map(),
    replaces: {
      text: [],
      regex: [],
    },
    voicenotice: false,
    voicenoticechannel: "",
    voicenoticetext: "",
    clock: {
      0: "",
      1: "",
      2: "",
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
      9: "",
      10: "",
      11: "",
      12: "",
      13: "",
      14: "",
      15: "",
      16: "",
      17: "",
      18: "",
      19: "",
      20: "",
      21: "",
      22: "",
      23: "",
      channel: "",
    },
    autoDeleteChannels: [],
  };
  if (!guildId) return rawSettings;
  const s_t = settings.get(guildId);
  if (s_t) return s_t;
  settings.set(guildId, rawSettings);
  return rawSettings;
};
/**現在の設定 */
export interface Settings extends Settings_ {
  /**
   * 声の設定
   * req: UserId
   */
  voice: Map<Snowflake, VoiceSettings>;
}
/**個人の声の設定 */
export interface VoiceSettings {
  /**現在の声id */
  set: number;
  /**
   * すべての声設定
   * req: voiceId
   */
  voices: Map<number, Voice>;
}
interface ObjectSettings extends Settings_ {
  guild: Snowflake;
  voice: Array<ObjectVoice>;
}
interface Settings_ {
  /**自動参加 */
  autojoin: boolean;
  /**読み上げるchid */
  readch: Snowflake;
  /**読み替え */
  replaces: Replaces;
  /**参加通知 */
  voicenotice: boolean;
  /**通知chid */
  voicenoticechannel: string;
  /**通知内容 */
  voicenoticetext: string;
  /**時刻通知 */
  clock: Clock;
  /**自動削除されるチャンネルと設定 */
  autoDeleteChannels: Array<AutoDeleteSettings>;
}
interface AutoDeleteSettings {
  /**チャンネルid */
  id: Snowflake;
  /**削除するまでの時間(h) */
  time: number;
}
/**声設定 */
export interface Voice {
  /**声id */
  id: number;
  volume: number;
  pitch: number;
  speed: number;
  intonation: number;
}
interface ObjectVoice {
  member: Snowflake;
  set: number;
  voice: Array<Voice>;
}
interface Clock {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  13: string;
  14: string;
  15: string;
  16: string;
  17: string;
  18: string;
  19: string;
  20: string;
  21: string;
  22: string;
  23: string;
  /**通知chid */
  channel: string;
}
interface Replaces {
  text: Array<Replaces_>;
  regex: Array<Replaces_>;
}
interface Replaces_ {
  before: string;
  after: string;
}
